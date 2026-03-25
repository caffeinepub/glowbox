import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  backendInterface as BackendAPI,
  MemberProfile,
  Product,
  ProductCategory,
  Salon,
  SalonService,
  ServiceCategory,
} from "../backend.d";
import { useActor } from "./useActor";

function getApi(actor: unknown): BackendAPI {
  return actor as BackendAPI;
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return getApi(actor).isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();
  const query = useQuery<MemberProfile | null, Error>({
    queryKey: ["myProfile"],
    queryFn: async (): Promise<MemberProfile | null> => {
      if (!actor) return null;
      const result = await getApi(actor).getMyProfile();
      return result.length > 0 ? (result[0] as MemberProfile) : null;
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: isFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetApprovedServices() {
  const { actor, isFetching } = useActor();
  return useQuery<SalonService[]>({
    queryKey: ["approvedServices"],
    queryFn: async () => {
      if (!actor) return [];
      return getApi(actor).getApprovedServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSalons() {
  const { actor, isFetching } = useActor();
  return useQuery<Salon[]>({
    queryKey: ["allSalons"],
    queryFn: async () => {
      if (!actor) return [];
      return getApi(actor).getAllSalons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<MemberProfile[]>({
    queryKey: ["adminMembers"],
    queryFn: async () => {
      if (!actor) return [];
      return getApi(actor).adminGetAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      address,
    }: { name: string; phone: string; address: string }) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).registerMember(name, phone, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (refId: string) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).confirmPayment(refId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useAdminConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminConfirmPayment(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMembers"] });
    },
  });
}

export function useAdminMarkHairSamplesReceived() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminMarkHairSamplesReceived(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMembers"] });
    },
  });
}

export function useAdminApproveMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminApproveMember(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMembers"] });
    },
  });
}

export function useAdminRejectMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminRejectMember(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMembers"] });
    },
  });
}

export function useAdminAddSalon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      location,
      description,
    }: { name: string; location: string; description: string }) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminAddSalon(name, location, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSalons"] });
    },
  });
}

export function useAdminAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      name,
      description,
      category,
    }: {
      salonId: bigint;
      name: string;
      description: string;
      category: ServiceCategory;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminAddService(
        salonId,
        name,
        description,
        category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedServices"] });
    },
  });
}

export function useAdminRemoveSalon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminRemoveSalon(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSalons"] });
    },
  });
}

export function useAdminRemoveService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminRemoveService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedServices"] });
    },
  });
}

// ---- Product hooks ----

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["allProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return getApi(actor).getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      const result = await getApi(actor).getProductById(id);
      return result.length > 0 ? (result[0] as Product) : null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      category,
      imageUrl,
      inStock,
      featured,
    }: {
      name: string;
      description: string;
      price: bigint;
      category: ProductCategory;
      imageUrl: string;
      inStock: boolean;
      featured: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminAddProduct(
        name,
        description,
        price,
        category,
        imageUrl,
        inStock,
        featured,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useAdminUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      price,
      category,
      imageUrl,
      inStock,
      featured,
    }: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      category: ProductCategory;
      imageUrl: string;
      inStock: boolean;
      featured: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminUpdateProduct(
        id,
        name,
        description,
        price,
        category,
        imageUrl,
        inStock,
        featured,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useAdminRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminRemoveProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useAdminToggleProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminToggleProductStock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useAdminToggleProductFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return getApi(actor).adminToggleProductFeatured(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
  });
}

export function useAdminGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminAllOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return getApi(actor).adminGetAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}
