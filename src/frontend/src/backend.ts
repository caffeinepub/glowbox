/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
function some<T>(value: T): Some<T> {
    return { __kind__: "Some", value: value };
}
function none(): None {
    return { __kind__: "None" };
}
function isNone<T>(option: Option<T>): option is None {
    return option.__kind__ === "None";
}
function isSome<T>(option: Option<T>): option is Some<T> {
    return option.__kind__ === "Some";
}
function unwrap<T>(option: Option<T>): T {
    if (isNone(option)) throw new Error("unwrap: none");
    return option.value;
}
function candid_some<T>(value: T): [T] { return [value]; }
function candid_none<T>(): [] { return []; }
function record_opt_to_undefined<T>(arg: T | null): T | undefined {
    return arg == null ? undefined : arg;
}
export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export type UserRole = { admin: null } | { user: null } | { guest: null };
export type MemberStatus = { approved: null } | { pending_inspection: null } | { pending_payment: null } | { rejected: null };
export type ServiceCategory = { haircare: null } | { skincare: null } | { makeup: null } | { nails: null } | { other: null };
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
    createAccount(email: string): Promise<boolean>;
    refreshAccountRole(email: string): Promise<boolean>;
    getPrincipalForEmail(email: string): Promise<[] | [Principal]>;
    emailExists(email: string): Promise<boolean>;
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

export class Backend implements backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        private processError?: (error: unknown) => never
    ) {}

    async _initializeAccessControlWithSecret(userSecret: string): Promise<void> {
        try { return await (this.actor as any)._initializeAccessControlWithSecret(userSecret); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async getCallerUserRole(): Promise<UserRole> {
        try { return await (this.actor as any).getCallerUserRole(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
        try { return await (this.actor as any).assignCallerUserRole(user, role); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async isCallerAdmin(): Promise<boolean> {
        try { return await (this.actor as any).isCallerAdmin(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async createAccount(email: string): Promise<boolean> {
        try { return await (this.actor as any).createAccount(email); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async refreshAccountRole(email: string): Promise<boolean> {
        try { return await (this.actor as any).refreshAccountRole(email); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async getPrincipalForEmail(email: string): Promise<[] | [Principal]> {
        try { return await (this.actor as any).getPrincipalForEmail(email); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async emailExists(email: string): Promise<boolean> {
        try { return await (this.actor as any).emailExists(email); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async registerMember(name: string, phone: string, address: string): Promise<boolean> {
        try { return await (this.actor as any).registerMember(name, phone, address); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async confirmPayment(): Promise<boolean> {
        try { return await (this.actor as any).confirmPayment(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async getMyProfile(): Promise<[] | [MemberProfile]> {
        try { return await (this.actor as any).getMyProfile(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async getApprovedServices(): Promise<SalonService[]> {
        try { return await (this.actor as any).getApprovedServices(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async getAllSalons(): Promise<Salon[]> {
        try { return await (this.actor as any).getAllSalons(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminGetAllMembers(): Promise<MemberProfile[]> {
        try { return await (this.actor as any).adminGetAllMembers(); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminApproveMember(member: Principal): Promise<boolean> {
        try { return await (this.actor as any).adminApproveMember(member); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminRejectMember(member: Principal): Promise<boolean> {
        try { return await (this.actor as any).adminRejectMember(member); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminAddSalon(name: string, location: string, description: string): Promise<[] | [bigint]> {
        try { return await (this.actor as any).adminAddSalon(name, location, description); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminAddService(salonId: bigint, name: string, description: string, category: ServiceCategory): Promise<[] | [bigint]> {
        try { return await (this.actor as any).adminAddService(salonId, name, description, category); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminRemoveSalon(id: bigint): Promise<boolean> {
        try { return await (this.actor as any).adminRemoveSalon(id); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
    async adminRemoveService(id: bigint): Promise<boolean> {
        try { return await (this.actor as any).adminRemoveService(id); }
        catch (e) { if (this.processError) this.processError(e); throw e; }
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}
export function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options: CreateActorOptions = {}
): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
