import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "./authorization/access-control";
import Approval "./user-approval/approval";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";

actor {
  // --- Authorization ---
  let accessControlState = AccessControl.initState();
  let approvalState = Approval.initState(accessControlState);

  let adminEmails : [Text] = ["katiyarritik26@gmail.com"];

  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) { Runtime.trap("CAFFEINE_ADMIN_TOKEN not set") };
      case (?adminToken) {
        AccessControl.initialize(accessControlState, caller, adminToken, userSecret);
      };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // --- Legacy types ---
  type LegacyMemberStatus = { #pending_payment; #pending_inspection; #approved; #rejected };
  type LegacyMemberProfile = {
    principal : Principal; name : Text; phone : Text; address : Text;
    status : LegacyMemberStatus; paymentConfirmed : Bool; registeredAt : Nat64;
  };
  type MemberProfileV2 = {
    principal : Principal; name : Text; phone : Text; address : Text;
    status : MemberStatus; paymentConfirmed : Bool; registeredAt : Nat64;
  };

  // --- Current Member Types ---
  public type MemberStatus = {
    #pending_payment; #payment_submitted; #waiting_hair_samples;
    #hair_samples_received; #approved; #rejected
  };

  public type MemberProfile = {
    principal : Principal; name : Text; phone : Text; address : Text;
    status : MemberStatus; paymentConfirmed : Bool; paymentRefId : Text; registeredAt : Nat64;
  };

  public type Salon = { id : Nat; name : Text; location : Text; description : Text };
  public type ServiceCategory = { #haircare; #skincare; #makeup; #nails; #other };
  public type SalonService = {
    id : Nat; salonId : Nat; name : Text; description : Text; category : ServiceCategory;
  };

  type OldProductCategory = {
    #hair_care; #shampoo; #conditioner; #skin_care; #makeup; #accessories; #other
  };
  type OldProduct = {
    id : Nat; name : Text; description : Text; price : Nat;
    category : OldProductCategory; imageUrl : Text; inStock : Bool; featured : Bool;
  };

  public type ProductCategory = {
    #hair_care; #shampoo; #conditioner; #skin_care; #makeup; #accessories; #nail_care; #facewash; #other
  };
  public type Product = {
    id : Nat; name : Text; description : Text; price : Nat;
    category : ProductCategory; imageUrl : Text; inStock : Bool; featured : Bool;
  };

  // --- Order Types ---
  public type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  public type Order = {
    id : Nat;
    orderId : Text;
    customerPrincipal : Principal;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    customerPincode : Text;
    items : [OrderItem];
    totalAmount : Nat;
    placedAt : Nat64;
  };

  // --- Stable State ---
  var members = Map.empty<Principal, LegacyMemberProfile>();
  var membersV2 = Map.empty<Principal, MemberProfileV2>();
  var membersV3 = Map.empty<Principal, MemberProfile>();

  var salons = Map.empty<Nat, Salon>();
  var services = Map.empty<Nat, SalonService>();

  var products = Map.empty<Nat, OldProduct>();
  var productsV2 = Map.empty<Nat, Product>();

  var orders = Map.empty<Nat, Order>();
  var nextOrderId : Nat = 1;

  var nextSalonId : Nat = 1;
  var nextServiceId : Nat = 1;
  var nextProductId : Nat = 1;
  var emailRegistry = Map.empty<Text, Principal>();

  // --- Migration ---
  system func postupgrade() {
    for ((k, v) in members.entries()) {
      let newStatus : MemberStatus = switch (v.status) {
        case (#pending_payment) { #pending_payment };
        case (#pending_inspection) { #hair_samples_received };
        case (#approved) { #approved };
        case (#rejected) { #rejected };
      };
      membersV3.add(k, {
        principal = v.principal; name = v.name; phone = v.phone;
        address = v.address; status = newStatus;
        paymentConfirmed = v.paymentConfirmed; paymentRefId = "";
        registeredAt = v.registeredAt;
      });
    };
    members := Map.empty<Principal, LegacyMemberProfile>();

    for ((k, v) in membersV2.entries()) {
      switch (membersV3.get(k)) {
        case (?_) {};
        case null {
          membersV3.add(k, {
            principal = v.principal; name = v.name; phone = v.phone;
            address = v.address; status = v.status;
            paymentConfirmed = v.paymentConfirmed; paymentRefId = "";
            registeredAt = v.registeredAt;
          });
        };
      };
    };
    membersV2 := Map.empty<Principal, MemberProfileV2>();

    for ((k, v) in products.entries()) {
      switch (productsV2.get(k)) {
        case (?_) {};
        case null {
          let newCat : ProductCategory = switch (v.category) {
            case (#hair_care) { #hair_care };
            case (#shampoo) { #shampoo };
            case (#conditioner) { #conditioner };
            case (#skin_care) { #skin_care };
            case (#makeup) { #makeup };
            case (#accessories) { #accessories };
            case (#other) { #other };
          };
          productsV2.add(k, {
            id = v.id; name = v.name; description = v.description;
            price = v.price; category = newCat; imageUrl = v.imageUrl;
            inStock = v.inStock; featured = v.featured;
          });
        };
      };
    };
    products := Map.empty<Nat, OldProduct>();
  };

  // --- Seed Data ---
  func seedData() {
    salons.add(1, { id = 1; name = "Glamour Studio"; location = "Mumbai, Maharashtra"; description = "Premium hair and skin care salon in the heart of Mumbai." });
    salons.add(2, { id = 2; name = "Beauty Bliss"; location = "Delhi, NCR"; description = "Specializing in makeup artistry and nail care services." });
    salons.add(3, { id = 3; name = "Radiance Spa"; location = "Bangalore, Karnataka"; description = "Holistic skin and body treatments using natural products." });
    nextSalonId := 4;
    services.add(1, { id = 1; salonId = 1; name = "Deep Conditioning Treatment"; description = "Intense moisture repair for dry and damaged hair."; category = #haircare });
    services.add(2, { id = 2; salonId = 1; name = "Keratin Smoothing"; description = "Frizz-free smooth hair treatment lasting up to 3 months."; category = #haircare });
    services.add(3, { id = 3; salonId = 1; name = "Facial Brightening"; description = "Vitamin C infused facial for glowing skin."; category = #skincare });
    services.add(4, { id = 4; salonId = 2; name = "Bridal Makeup"; description = "Full bridal makeup with trial session included."; category = #makeup });
    services.add(5, { id = 5; salonId = 2; name = "Gel Nail Extension"; description = "Long-lasting gel nail extensions with custom designs."; category = #nails });
    services.add(6, { id = 6; salonId = 3; name = "Hydra Facial"; description = "Advanced hydrating facial with anti-aging benefits."; category = #skincare });
    services.add(7, { id = 7; salonId = 3; name = "Aromatherapy Massage"; description = "Relaxing full-body aromatherapy massage."; category = #other });
    nextServiceId := 8;

    productsV2.add(1, { id = 1; name = "Argan Oil Shampoo"; description = "Nourishing argan oil shampoo for dry and frizzy hair. Sulfate-free formula for daily use."; price = 499; category = #shampoo; imageUrl = ""; inStock = true; featured = true });
    productsV2.add(2, { id = 2; name = "Keratin Conditioner"; description = "Deep conditioning treatment that repairs and strengthens damaged hair fibers."; price = 549; category = #conditioner; imageUrl = ""; inStock = true; featured = true });
    productsV2.add(3, { id = 3; name = "Hair Growth Serum"; description = "Clinically tested serum with biotin and caffeine to stimulate hair follicles and reduce hair fall."; price = 899; category = #hair_care; imageUrl = ""; inStock = true; featured = false });
    productsV2.add(4, { id = 4; name = "Vitamin C Brightening Cream"; description = "Daily moisturizer with vitamin C for a radiant, even skin tone."; price = 749; category = #skin_care; imageUrl = ""; inStock = true; featured = true });
    productsV2.add(5, { id = 5; name = "Matte Lip Color Set"; description = "Set of 6 long-lasting matte lip colors in Indian-friendly shades."; price = 650; category = #makeup; imageUrl = ""; inStock = false; featured = false });
    productsV2.add(6, { id = 6; name = "Satin Hair Scrunchie Pack"; description = "Set of 5 satin scrunchies to reduce hair breakage and frizz during sleep."; price = 299; category = #accessories; imageUrl = ""; inStock = true; featured = false });
    nextProductId := 7;
  };

  seedData();

  func isAdminEmail(email : Text) : Bool {
    for (e in adminEmails.vals()) { if (e == email) { return true } };
    false;
  };

  // --- Email Registry ---
  public shared ({ caller }) func createAccount(email : Text) : async Bool {
    switch (emailRegistry.get(email)) {
      case (?existing) { existing == caller };
      case null {
        emailRegistry.add(email, caller);
        if (isAdminEmail(email)) {
          accessControlState.userRoles.add(caller, #admin);
          accessControlState.adminAssigned := true;
        } else {
          accessControlState.userRoles.add(caller, #user);
        };
        true;
      };
    };
  };

  public shared ({ caller }) func refreshAccountRole(email : Text) : async Bool {
    switch (emailRegistry.get(email)) {
      case (?existing) {
        if (existing == caller) {
          if (isAdminEmail(email)) {
            accessControlState.userRoles.add(caller, #admin);
            accessControlState.adminAssigned := true;
          } else {
            switch (accessControlState.userRoles.get(caller)) {
              case (null) { accessControlState.userRoles.add(caller, #user) };
              case (?_) {};
            };
          };
          true;
        } else { false };
      };
      case null { false };
    };
  };

  public query func emailExists(email : Text) : async Bool {
    emailRegistry.get(email) != null;
  };

  public query func getPrincipalForEmail(email : Text) : async ?Principal {
    emailRegistry.get(email);
  };

  // --- Member Functions ---
  public shared ({ caller }) func registerMember(name : Text, phone : Text, address : Text) : async Bool {
    switch (membersV3.get(caller)) {
      case (?_) { false };
      case null {
        membersV3.add(caller, {
          principal = caller; name; phone; address;
          status = #pending_payment; paymentConfirmed = false;
          paymentRefId = ""; registeredAt = Prim.time();
        });
        Approval.requestApproval(approvalState, caller);
        true;
      };
    };
  };

  public shared ({ caller }) func confirmPayment(refId : Text) : async Bool {
    switch (membersV3.get(caller)) {
      case null { false };
      case (?p) {
        membersV3.add(caller, { p with status = #payment_submitted; paymentRefId = refId });
        true;
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?MemberProfile {
    membersV3.get(caller);
  };

  public query ({ caller }) func getApprovedServices() : async [SalonService] {
    switch (membersV3.get(caller)) {
      case (?p) { if (p.status == #approved) { services.values().toArray() } else { [] } };
      case null { [] };
    };
  };

  public query func getAllSalons() : async [Salon] {
    salons.values().toArray();
  };

  // --- Product Functions ---
  public query func getAllProducts() : async [Product] {
    productsV2.values().toArray();
  };

  public query func getProductById(id : Nat) : async ?Product {
    productsV2.get(id);
  };

  // --- Order Functions ---
  public shared ({ caller }) func placeOrder(
    orderId : Text,
    customerName : Text,
    customerPhone : Text,
    customerAddress : Text,
    customerPincode : Text,
    items : [OrderItem],
    totalAmount : Nat
  ) : async ?Nat {
    let id = nextOrderId;
    orders.add(id, {
      id;
      orderId;
      customerPrincipal = caller;
      customerName;
      customerPhone;
      customerAddress;
      customerPincode;
      items;
      totalAmount;
      placedAt = Prim.time();
    });
    nextOrderId += 1;
    ?id;
  };

  public query (_) func getMyOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func adminGetAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return [] };
    orders.values().toArray();
  };

  // --- Admin Member Functions ---
  public query ({ caller }) func adminGetAllMembers() : async [MemberProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return [] };
    membersV3.values().toArray();
  };

  public shared ({ caller }) func adminConfirmPayment(member : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (membersV3.get(member)) {
      case null { false };
      case (?p) { membersV3.add(member, { p with status = #waiting_hair_samples; paymentConfirmed = true }); true };
    };
  };

  public shared ({ caller }) func adminMarkHairSamplesReceived(member : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (membersV3.get(member)) {
      case null { false };
      case (?p) { membersV3.add(member, { p with status = #hair_samples_received }); true };
    };
  };

  public shared ({ caller }) func adminApproveMember(member : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (membersV3.get(member)) {
      case null { false };
      case (?p) {
        membersV3.add(member, { p with status = #approved });
        Approval.setApproval(approvalState, member, #approved);
        true;
      };
    };
  };

  public shared ({ caller }) func adminRejectMember(member : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (membersV3.get(member)) {
      case null { false };
      case (?p) {
        membersV3.add(member, { p with status = #rejected });
        Approval.setApproval(approvalState, member, #rejected);
        true;
      };
    };
  };

  public shared ({ caller }) func adminAddSalon(name : Text, location : Text, description : Text) : async ?Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return null };
    let id = nextSalonId;
    salons.add(id, { id; name; location; description });
    nextSalonId += 1;
    ?id;
  };

  public shared ({ caller }) func adminAddService(salonId : Nat, name : Text, description : Text, category : ServiceCategory) : async ?Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return null };
    let id = nextServiceId;
    services.add(id, { id; salonId; name; description; category });
    nextServiceId += 1;
    ?id;
  };

  public shared ({ caller }) func adminRemoveSalon(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    salons.remove(id);
    true;
  };

  public shared ({ caller }) func adminRemoveService(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    services.remove(id);
    true;
  };

  // --- Admin Product Functions ---
  public shared ({ caller }) func adminAddProduct(
    name : Text, description : Text, price : Nat,
    category : ProductCategory, imageUrl : Text, inStock : Bool, featured : Bool
  ) : async ?Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return null };
    let id = nextProductId;
    productsV2.add(id, { id; name; description; price; category; imageUrl; inStock; featured });
    nextProductId += 1;
    ?id;
  };

  public shared ({ caller }) func adminUpdateProduct(
    id : Nat, name : Text, description : Text, price : Nat,
    category : ProductCategory, imageUrl : Text, inStock : Bool, featured : Bool
  ) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (productsV2.get(id)) {
      case null { false };
      case (?_) {
        productsV2.add(id, { id; name; description; price; category; imageUrl; inStock; featured });
        true;
      };
    };
  };

  public shared ({ caller }) func adminRemoveProduct(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    productsV2.remove(id);
    true;
  };

  public shared ({ caller }) func adminToggleProductStock(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (productsV2.get(id)) {
      case null { false };
      case (?p) { productsV2.add(id, { p with inStock = not p.inStock }); true };
    };
  };

  public shared ({ caller }) func adminToggleProductFeatured(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (productsV2.get(id)) {
      case null { false };
      case (?p) { productsV2.add(id, { p with featured = not p.featured }); true };
    };
  };
};
