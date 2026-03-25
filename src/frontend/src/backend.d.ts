import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export type UserRole = { admin: null } | { user: null } | { guest: null };
export type MemberStatus =
    | { approved: null }
    | { pending_payment: null }
    | { payment_submitted: null }
    | { waiting_hair_samples: null }
    | { hair_samples_received: null }
    | { rejected: null };
export type ServiceCategory =
    | { haircare: null }
    | { skincare: null }
    | { makeup: null }
    | { nails: null }
    | { other: null };

export type ProductCategory =
    | { hair_care: null }
    | { shampoo: null }
    | { conditioner: null }
    | { skin_care: null }
    | { makeup: null }
    | { accessories: null }
    | { nail_care: null }
    | { facewash: null }
    | { other: null };

export interface Product {
    id: bigint;
    name: string;
    description: string;
    price: bigint;
    category: ProductCategory;
    imageUrl: string;
    inStock: boolean;
    featured: boolean;
}

export interface MemberProfile {
    principal: Principal;
    name: string;
    phone: string;
    address: string;
    status: MemberStatus;
    paymentConfirmed: boolean;
    paymentRefId: string;
    registeredAt: bigint;
}

export interface Salon {
    id: bigint;
    name: string;
    location: string;
    description: string;
}

export interface SalonService {
    id: bigint;
    salonId: bigint;
    name: string;
    description: string;
    category: ServiceCategory;
}


export interface OrderItem {
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: bigint;
}

export interface Order {
    id: bigint;
    orderId: string;
    customerPrincipal: Principal;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerPincode: string;
    items: OrderItem[];
    totalAmount: bigint;
    placedAt: bigint;
}

export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    createAccount(email: string): Promise<boolean>;
    refreshAccountRole(email: string): Promise<boolean>;
    emailExists(email: string): Promise<boolean>;
    getPrincipalForEmail(email: string): Promise<[] | [Principal]>;
    registerMember(name: string, phone: string, address: string): Promise<boolean>;
    confirmPayment(refId: string): Promise<boolean>;
    getMyProfile(): Promise<[] | [MemberProfile]>;
    getApprovedServices(): Promise<SalonService[]>;
    getAllSalons(): Promise<Salon[]>;
    adminGetAllMembers(): Promise<MemberProfile[]>;
    adminConfirmPayment(member: Principal): Promise<boolean>;
    adminMarkHairSamplesReceived(member: Principal): Promise<boolean>;
    adminApproveMember(member: Principal): Promise<boolean>;
    adminRejectMember(member: Principal): Promise<boolean>;
    adminAddSalon(name: string, location: string, description: string): Promise<[] | [bigint]>;
    adminAddService(salonId: bigint, name: string, description: string, category: ServiceCategory): Promise<[] | [bigint]>;
    adminRemoveSalon(id: bigint): Promise<boolean>;
    adminRemoveService(id: bigint): Promise<boolean>;
    getAllProducts(): Promise<Product[]>;
    getProductById(id: bigint): Promise<[] | [Product]>;
    adminAddProduct(name: string, description: string, price: bigint, category: ProductCategory, imageUrl: string, inStock: boolean, featured: boolean): Promise<[] | [bigint]>;
    adminUpdateProduct(id: bigint, name: string, description: string, price: bigint, category: ProductCategory, imageUrl: string, inStock: boolean, featured: boolean): Promise<boolean>;
    adminRemoveProduct(id: bigint): Promise<boolean>;
    adminToggleProductStock(id: bigint): Promise<boolean>;
    adminToggleProductFeatured(id: bigint): Promise<boolean>;
    uploadProductImage(file: File): Promise<string>;
    placeOrder(orderId: string, customerName: string, customerPhone: string, customerAddress: string, customerPincode: string, items: OrderItem[], totalAmount: bigint): Promise<boolean>;
    adminGetAllOrders(): Promise<Order[]>;
}
