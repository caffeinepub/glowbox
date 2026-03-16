/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const MemberStatus = IDL.Variant({
  pending_payment: IDL.Null,
  payment_submitted: IDL.Null,
  waiting_hair_samples: IDL.Null,
  hair_samples_received: IDL.Null,
  approved: IDL.Null,
  rejected: IDL.Null,
});

const MemberProfile = IDL.Record({
  principal: IDL.Principal,
  name: IDL.Text,
  phone: IDL.Text,
  address: IDL.Text,
  status: MemberStatus,
  paymentConfirmed: IDL.Bool,
  registeredAt: IDL.Nat64,
});

const Salon = IDL.Record({
  id: IDL.Nat,
  name: IDL.Text,
  location: IDL.Text,
  description: IDL.Text,
});

const ServiceCategory = IDL.Variant({
  haircare: IDL.Null,
  skincare: IDL.Null,
  makeup: IDL.Null,
  nails: IDL.Null,
  other: IDL.Null,
});

const SalonService = IDL.Record({
  id: IDL.Nat,
  salonId: IDL.Nat,
  name: IDL.Text,
  description: IDL.Text,
  category: ServiceCategory,
});

const UserRole = IDL.Variant({
  admin: IDL.Null,
  user: IDL.Null,
  guest: IDL.Null,
});

export const idlService = IDL.Service({
  _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
  getCallerUserRole: IDL.Func([], [UserRole], ['query']),
  assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
  isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
  createAccount: IDL.Func([IDL.Text], [IDL.Bool], []),
  emailExists: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  registerMember: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
  confirmPayment: IDL.Func([], [IDL.Bool], []),
  getMyProfile: IDL.Func([], [IDL.Opt(MemberProfile)], ['query']),
  getApprovedServices: IDL.Func([], [IDL.Vec(SalonService)], ['query']),
  getAllSalons: IDL.Func([], [IDL.Vec(Salon)], ['query']),
  adminGetAllMembers: IDL.Func([], [IDL.Vec(MemberProfile)], ['query']),
  adminConfirmPayment: IDL.Func([IDL.Principal], [IDL.Bool], []),
  adminMarkHairSamplesReceived: IDL.Func([IDL.Principal], [IDL.Bool], []),
  adminApproveMember: IDL.Func([IDL.Principal], [IDL.Bool], []),
  adminRejectMember: IDL.Func([IDL.Principal], [IDL.Bool], []),
  adminAddSalon: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Opt(IDL.Nat)], []),
  adminAddService: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, ServiceCategory], [IDL.Opt(IDL.Nat)], []),
  adminRemoveSalon: IDL.Func([IDL.Nat], [IDL.Bool], []),
  adminRemoveService: IDL.Func([IDL.Nat], [IDL.Bool], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const MemberStatus = IDL.Variant({
    pending_payment: IDL.Null,
    payment_submitted: IDL.Null,
    waiting_hair_samples: IDL.Null,
    hair_samples_received: IDL.Null,
    approved: IDL.Null,
    rejected: IDL.Null,
  });
  const MemberProfile = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
    phone: IDL.Text,
    address: IDL.Text,
    status: MemberStatus,
    paymentConfirmed: IDL.Bool,
    registeredAt: IDL.Nat64,
  });
  const Salon = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    location: IDL.Text,
    description: IDL.Text,
  });
  const ServiceCategory = IDL.Variant({
    haircare: IDL.Null,
    skincare: IDL.Null,
    makeup: IDL.Null,
    nails: IDL.Null,
    other: IDL.Null,
  });
  const SalonService = IDL.Record({
    id: IDL.Nat,
    salonId: IDL.Nat,
    name: IDL.Text,
    description: IDL.Text,
    category: ServiceCategory,
  });
  const UserRole = IDL.Variant({
    admin: IDL.Null,
    user: IDL.Null,
    guest: IDL.Null,
  });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    getCallerUserRole: IDL.Func([], [UserRole], ['query']),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
    createAccount: IDL.Func([IDL.Text], [IDL.Bool], []),
    emailExists: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    registerMember: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    confirmPayment: IDL.Func([], [IDL.Bool], []),
    getMyProfile: IDL.Func([], [IDL.Opt(MemberProfile)], ['query']),
    getApprovedServices: IDL.Func([], [IDL.Vec(SalonService)], ['query']),
    getAllSalons: IDL.Func([], [IDL.Vec(Salon)], ['query']),
    adminGetAllMembers: IDL.Func([], [IDL.Vec(MemberProfile)], ['query']),
    adminConfirmPayment: IDL.Func([IDL.Principal], [IDL.Bool], []),
    adminMarkHairSamplesReceived: IDL.Func([IDL.Principal], [IDL.Bool], []),
    adminApproveMember: IDL.Func([IDL.Principal], [IDL.Bool], []),
    adminRejectMember: IDL.Func([IDL.Principal], [IDL.Bool], []),
    adminAddSalon: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Opt(IDL.Nat)], []),
    adminAddService: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, ServiceCategory], [IDL.Opt(IDL.Nat)], []),
    adminRemoveSalon: IDL.Func([IDL.Nat], [IDL.Bool], []),
    adminRemoveService: IDL.Func([IDL.Nat], [IDL.Bool], []),
  });
};

export const init = ({ IDL }) => { return []; };
