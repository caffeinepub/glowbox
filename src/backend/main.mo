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

  // --- Types ---
  public type MemberStatus = { #pending_payment; #pending_inspection; #approved; #rejected };

  public type MemberProfile = {
    principal : Principal;
    name : Text;
    phone : Text;
    address : Text;
    status : MemberStatus;
    paymentConfirmed : Bool;
    registeredAt : Nat64;
  };

  public type Salon = {
    id : Nat;
    name : Text;
    location : Text;
    description : Text;
  };

  public type ServiceCategory = { #haircare; #skincare; #makeup; #nails; #other };

  public type SalonService = {
    id : Nat;
    salonId : Nat;
    name : Text;
    description : Text;
    category : ServiceCategory;
  };

  // --- State ---
  var members = Map.empty<Principal, MemberProfile>();
  var salons = Map.empty<Nat, Salon>();
  var services = Map.empty<Nat, SalonService>();
  var nextSalonId : Nat = 1;
  var nextServiceId : Nat = 1;

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
  };

  seedData();

  // --- Member Functions ---
  public shared ({ caller }) func registerMember(name : Text, phone : Text, address : Text) : async Bool {
    switch (members.get(caller)) {
      case (?_) { false };
      case null {
        let profile : MemberProfile = {
          principal = caller;
          name;
          phone;
          address;
          status = #pending_payment;
          paymentConfirmed = false;
          registeredAt = Prim.time();
        };
        members.add(caller, profile);
        Approval.requestApproval(approvalState, caller);
        true;
      };
    };
  };

  public shared ({ caller }) func confirmPayment() : async Bool {
    switch (members.get(caller)) {
      case null { false };
      case (?p) {
        let updated : MemberProfile = { p with status = #pending_inspection; paymentConfirmed = true };
        members.add(caller, updated);
        true;
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?MemberProfile {
    members.get(caller);
  };

  public query ({ caller }) func getApprovedServices() : async [SalonService] {
    switch (members.get(caller)) {
      case (?p) {
        if (p.status == #approved) { services.values().toArray() } else { [] };
      };
      case null { [] };
    };
  };

  public query func getAllSalons() : async [Salon] {
    salons.values().toArray();
  };

  // --- Admin Functions ---
  public query ({ caller }) func adminGetAllMembers() : async [MemberProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return [] };
    members.values().toArray();
  };

  public shared ({ caller }) func adminApproveMember(member : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (members.get(member)) {
      case null { false };
      case (?p) {
        members.add(member, { p with status = #approved });
        Approval.setApproval(approvalState, member, #approved);
        true;
      };
    };
  };

  public shared ({ caller }) func adminRejectMember(member : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    switch (members.get(member)) {
      case null { false };
      case (?p) {
        members.add(member, { p with status = #rejected });
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
    ignore salons.remove(id);
    true;
  };

  public shared ({ caller }) func adminRemoveService(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return false };
    ignore services.remove(id);
    true;
  };
};
