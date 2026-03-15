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
    | { pending_inspection: null }
    | { pending_payment: null }
    | { rejected: null };
export type ServiceCategory =
    | { haircare: null }
    | { skincare: null }
    | { makeup: null }
    | { nails: null }
    | { other: null };

export interface MemberProfile {
    principal: Principal;
    name: string;
    phone: string;
    address: string;
    status: MemberStatus;
    paymentConfirmed: boolean;
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

export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    registerMember(name: string, phone: string, address: string): Promise<boolean>;
    confirmPayment(): Promise<boolean>;
    getMyProfile(): Promise<[] | [MemberProfile]>;
    getApprovedServices(): Promise<SalonService[]>;
    getAllSalons(): Promise<Salon[]>;
    adminGetAllMembers(): Promise<MemberProfile[]>;
    adminApproveMember(member: Principal): Promise<boolean>;
    adminRejectMember(member: Principal): Promise<boolean>;
    adminAddSalon(name: string, location: string, description: string): Promise<[] | [bigint]>;
    adminAddService(salonId: bigint, name: string, description: string, category: ServiceCategory): Promise<[] | [bigint]>;
    adminRemoveSalon(id: bigint): Promise<boolean>;
    adminRemoveService(id: bigint): Promise<boolean>;
}
