import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Copy,
  Edit,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  ShieldAlert,
  ShoppingCart,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  MemberStatus,
  Order,
  OrderItem,
  ProductCategory,
  ServiceCategory,
} from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";
import {
  useAdminAddProduct,
  useAdminAddSalon,
  useAdminAddService,
  useAdminApproveMember,
  useAdminConfirmPayment,
  useAdminGetAllMembers,
  useAdminGetAllOrders,
  useAdminMarkHairSamplesReceived,
  useAdminRejectMember,
  useAdminRemoveProduct,
  useAdminRemoveSalon,
  useAdminRemoveService,
  useAdminToggleProductFeatured,
  useAdminToggleProductStock,
  useAdminUpdateProduct,
  useGetAllProducts,
  useGetAllSalons,
  useGetApprovedServices,
  useIsAdmin,
} from "../hooks/useQueries";

function statusLabel(s: MemberStatus) {
  if ("pending_payment" in s)
    return { text: "Pending Payment", cls: "bg-gray-100 text-gray-700" };
  if ("payment_submitted" in s)
    return { text: "Payment Submitted", cls: "bg-yellow-100 text-yellow-700" };
  if ("waiting_hair_samples" in s)
    return { text: "Awaiting Hair Samples", cls: "bg-blue-100 text-blue-700" };
  if ("hair_samples_received" in s)
    return { text: "Samples Received", cls: "bg-purple-100 text-purple-700" };
  if ("approved" in s)
    return { text: "Approved", cls: "bg-green-100 text-green-700" };
  return { text: "Rejected", cls: "bg-red-100 text-red-700" };
}

const SERVICE_CATEGORIES: { value: string; label: string }[] = [
  { value: "haircare", label: "Hair Care" },
  { value: "skincare", label: "Skin Care" },
  { value: "makeup", label: "Makeup" },
  { value: "nails", label: "Nails" },
  { value: "other", label: "Other" },
];

const PRODUCT_CATEGORIES: { value: string; label: string }[] = [
  { value: "hair_care", label: "Hair Care" },
  { value: "shampoo", label: "Shampoo" },
  { value: "conditioner", label: "Conditioner" },
  { value: "skin_care", label: "Skin Care" },
  { value: "makeup", label: "Makeup" },
  { value: "accessories", label: "Accessories" },
  { value: "nail_care", label: "Nail Care" },
  { value: "facewash", label: "Facewash" },
  { value: "other", label: "Other" },
];

const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  hair_care: "Hair Care",
  shampoo: "Shampoo",
  conditioner: "Conditioner",
  skin_care: "Skin Care",
  makeup: "Makeup",
  accessories: "Accessories",
  nail_care: "Nail Care",
  facewash: "Facewash",
  other: "Other",
};

function categoryToMotoko(val: string): ServiceCategory {
  const map: Record<string, ServiceCategory> = {
    haircare: { haircare: null },
    skincare: { skincare: null },
    makeup: { makeup: null },
    nails: { nails: null },
    other: { other: null },
  };
  return map[val] ?? { other: null };
}

function categoryToProductMotoko(val: string): ProductCategory {
  const map: Record<string, ProductCategory> = {
    hair_care: { hair_care: null },
    shampoo: { shampoo: null },
    conditioner: { conditioner: null },
    skin_care: { skin_care: null },
    makeup: { makeup: null },
    accessories: { accessories: null },
    nail_care: { nail_care: null },
    facewash: { facewash: null },
    other: { other: null },
  };
  return map[val] ?? { other: null };
}

function getProductCategoryKey(cat: ProductCategory): string {
  return Object.keys(cat)[0];
}

export default function AdminPage() {
  const { identity, isInitializing } = useAuth();
  const navigate = useNavigate();
  const { actor } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: members = [], isLoading: membersLoading } =
    useAdminGetAllMembers();
  const { data: orders = [], isLoading: ordersLoading } =
    useAdminGetAllOrders();
  const { data: salons = [] } = useGetAllSalons();
  const { data: services = [] } = useGetApprovedServices();
  const { data: products = [], isLoading: productsLoading } =
    useGetAllProducts();

  const confirmPaymentAdmin = useAdminConfirmPayment();
  const markSamplesReceived = useAdminMarkHairSamplesReceived();
  const approveMember = useAdminApproveMember();
  const rejectMember = useAdminRejectMember();
  const addSalon = useAdminAddSalon();
  const addService = useAdminAddService();
  const removeSalon = useAdminRemoveSalon();
  const removeService = useAdminRemoveService();
  const addProduct = useAdminAddProduct();
  const updateProduct = useAdminUpdateProduct();
  const removeProduct = useAdminRemoveProduct();
  const toggleStock = useAdminToggleProductStock();
  const toggleFeatured = useAdminToggleProductFeatured();

  // Salon state
  const [salonDialogOpen, setSalonDialogOpen] = useState(false);
  const [salonName, setSalonName] = useState("");
  const [salonLocation, setSalonLocation] = useState("");
  const [salonDesc, setSalonDesc] = useState("");

  // Service state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceSalonId, setServiceSalonId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");

  // Product state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<bigint | null>(null);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productExistingImageUrls, setProductExistingImageUrls] = useState<
    string[]
  >([]);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {},
  );
  const [productInStock, setProductInStock] = useState(true);
  const [productFeatured, setProductFeatured] = useState(false);

  if (isInitializing) {
    return null;
  }
  if (!identity) {
    navigate({ to: "/auth" });
    return null;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          className="flex-1 py-12 container"
          data-ocid="admin.loading_state"
        >
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          className="flex-1 flex items-center justify-center"
          data-ocid="admin.error_state"
        >
          <div className="text-center space-y-4">
            <ShieldAlert className="w-16 h-16 mx-auto text-destructive opacity-60" />
            <h1 className="font-display text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don&apos;t have admin privileges.
            </p>
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              data-ocid="admin.dashboard.button"
            >
              Go to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleConfirmPayment = async (principal: Principal) => {
    try {
      await confirmPaymentAdmin.mutateAsync(principal);
      toast.success(
        "Payment confirmed! Customer notified to send hair samples.",
      );
    } catch {
      toast.error("Failed to confirm payment.");
    }
  };

  const handleMarkSamplesReceived = async (principal: Principal) => {
    try {
      await markSamplesReceived.mutateAsync(principal);
      toast.success("Marked as hair samples received.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleApprove = async (principal: Principal) => {
    try {
      await approveMember.mutateAsync(principal);
      toast.success("Member approved!");
    } catch {
      toast.error("Failed to approve member.");
    }
  };

  const handleReject = async (principal: Principal) => {
    try {
      await rejectMember.mutateAsync(principal);
      toast.success("Member rejected.");
    } catch {
      toast.error("Failed to reject member.");
    }
  };

  const handleAddSalon = async () => {
    if (!salonName.trim() || !salonLocation.trim()) {
      toast.error("Salon name and location are required.");
      return;
    }
    try {
      await addSalon.mutateAsync({
        name: salonName,
        location: salonLocation,
        description: salonDesc,
      });
      toast.success("Salon added!");
      setSalonDialogOpen(false);
      setSalonName("");
      setSalonLocation("");
      setSalonDesc("");
    } catch {
      toast.error("Failed to add salon.");
    }
  };

  const handleAddService = async () => {
    if (!serviceSalonId || !serviceName.trim() || !serviceCategory) {
      toast.error("All fields are required.");
      return;
    }
    try {
      await addService.mutateAsync({
        salonId: BigInt(serviceSalonId),
        name: serviceName,
        description: serviceDesc,
        category: categoryToMotoko(serviceCategory),
      });
      toast.success("Service added!");
      setServiceDialogOpen(false);
      setServiceSalonId("");
      setServiceName("");
      setServiceDesc("");
      setServiceCategory("");
    } catch {
      toast.error("Failed to add service.");
    }
  };

  const handleRemoveSalon = async (id: bigint) => {
    try {
      await removeSalon.mutateAsync(id);
      toast.success("Salon removed.");
    } catch {
      toast.error("Failed to remove salon.");
    }
  };

  const handleRemoveService = async (id: bigint) => {
    try {
      await removeService.mutateAsync(id);
      toast.success("Service removed.");
    } catch {
      toast.error("Failed to remove service.");
    }
  };

  const resetProductForm = () => {
    setEditProductId(null);
    setProductName("");
    setProductDesc("");
    setProductPrice("");
    setProductCategory("");
    setProductExistingImageUrls([]);
    setProductImageFiles([]);
    setUploadProgress({});
    setProductInStock(true);
    setProductFeatured(false);
  };

  const openEditProduct = (p: {
    id: bigint;
    name: string;
    description: string;
    price: bigint;
    category: ProductCategory;
    imageUrl: string;
    inStock: boolean;
    featured: boolean;
  }) => {
    setEditProductId(p.id);
    setProductName(p.name);
    setProductDesc(p.description);
    setProductPrice(p.price.toString());
    setProductCategory(getProductCategoryKey(p.category));
    setProductExistingImageUrls(
      p.imageUrl ? p.imageUrl.split("|").filter(Boolean) : [],
    );
    setProductImageFiles([]);
    setUploadProgress({});
    setProductInStock(p.inStock);
    setProductFeatured(p.featured);
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !productPrice || !productCategory) {
      toast.error("Name, price and category are required.");
      return;
    }
    if (!actor) {
      toast.error("Actor not available. Please try again.");
      return;
    }

    const price = BigInt(Math.round(Number(productPrice)));
    const cat = categoryToProductMotoko(productCategory);

    // Upload each new image file
    let uploadedUrls: string[] = [];
    if (productImageFiles.length > 0) {
      setProductImageUploading(true);
      try {
        const newProgress: Record<number, number> = {};
        for (let i = 0; i < productImageFiles.length; i++) {
          newProgress[i] = 0;
        }
        setUploadProgress(newProgress);

        const uploadPromises = productImageFiles.map(async (file, idx) => {
          const url = await (actor as any).uploadProductImage(file);
          setUploadProgress((prev) => ({ ...prev, [idx]: 100 }));
          return url as string;
        });
        uploadedUrls = await Promise.all(uploadPromises);
      } catch (err) {
        console.error("[Focliy] Image upload error:", err);
        toast.error("Failed to upload one or more images.");
        setProductImageUploading(false);
        return;
      }
      setProductImageUploading(false);
    }

    // Combine existing + newly uploaded URLs
    const allImageUrls = [...productExistingImageUrls, ...uploadedUrls];
    const finalImageUrl = allImageUrls.join("|");

    try {
      if (editProductId !== null) {
        await updateProduct.mutateAsync({
          id: editProductId,
          name: productName,
          description: productDesc,
          price,
          category: cat,
          imageUrl: finalImageUrl,
          inStock: productInStock,
          featured: productFeatured,
        });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync({
          name: productName,
          description: productDesc,
          price,
          category: cat,
          imageUrl: finalImageUrl,
          inStock: productInStock,
          featured: productFeatured,
        });
        toast.success("Product added!");
      }
      setProductDialogOpen(false);
      resetProductForm();
    } catch {
      toast.error("Failed to save product.");
    }
  };

  const handleRemoveProduct = async (id: bigint) => {
    try {
      await removeProduct.mutateAsync(id);
      toast.success("Product removed.");
    } catch {
      toast.error("Failed to remove product.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage members, products, and salon services.
            </p>
          </motion.div>

          <Tabs defaultValue="members">
            <TabsList className="mb-6">
              <TabsTrigger value="members" data-ocid="admin.members.tab">
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="products" data-ocid="admin.products.tab">
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="salons" data-ocid="admin.salons.tab">
                Salons & Services ({salons.length})
              </TabsTrigger>
              <TabsTrigger value="orders" data-ocid="admin.orders.tab">
                Orders ({orders.length})
              </TabsTrigger>
            </TabsList>

            {/* ---- MEMBERS TAB ---- */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    All Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div
                      className="space-y-3"
                      data-ocid="admin.members.loading_state"
                    >
                      {[1, 2, 3].map((_i) => (
                        <Skeleton key={_i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : members.length === 0 ? (
                    <div
                      className="py-12 text-center text-muted-foreground"
                      data-ocid="admin.members.empty_state"
                    >
                      No members registered yet.
                    </div>
                  ) : (
                    <div
                      className="overflow-x-auto"
                      data-ocid="admin.members.table"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Payment Ref ID</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member, idx) => {
                            const sl = statusLabel(member.status);
                            const canConfirmPayment =
                              "payment_submitted" in member.status;
                            const canMarkSamples =
                              "waiting_hair_samples" in member.status;
                            const canApproveReject =
                              "hair_samples_received" in member.status;
                            const hasActions =
                              canConfirmPayment ||
                              canMarkSamples ||
                              canApproveReject;
                            return (
                              <TableRow
                                key={member.principal.toString()}
                                data-ocid={`admin.members.row.${idx + 1}`}
                              >
                                <TableCell className="font-medium">
                                  {member.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {member.phone}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                                  {member.address || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${sl.cls} text-xs border-0`}
                                  >
                                    {sl.text}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      member.paymentConfirmed
                                        ? "default"
                                        : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {member.paymentConfirmed
                                      ? "Confirmed"
                                      : "Pending"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {member.paymentRefId ? (
                                    <div className="flex items-center gap-1.5">
                                      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded max-w-[140px] truncate block">
                                        {member.paymentRefId}
                                      </code>
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            member.paymentRefId,
                                          );
                                          toast.success("Copied!");
                                        }}
                                        data-ocid={`admin.members.copy_button.${idx + 1}`}
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {hasActions && (
                                    <div className="flex flex-wrap gap-2">
                                      {canConfirmPayment && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                                          onClick={() =>
                                            handleConfirmPayment(
                                              member.principal,
                                            )
                                          }
                                          disabled={
                                            confirmPaymentAdmin.isPending
                                          }
                                          data-ocid={`admin.members.confirm_button.${idx + 1}`}
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                          Confirm Payment
                                        </Button>
                                      )}
                                      {canMarkSamples && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="gap-1 text-purple-700 border-purple-200 hover:bg-purple-50"
                                          onClick={() =>
                                            handleMarkSamplesReceived(
                                              member.principal,
                                            )
                                          }
                                          disabled={
                                            markSamplesReceived.isPending
                                          }
                                          data-ocid={`admin.members.secondary_button.${idx + 1}`}
                                        >
                                          <Package className="w-3.5 h-3.5" />{" "}
                                          Samples Received
                                        </Button>
                                      )}
                                      {canApproveReject && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 text-green-700 border-green-200 hover:bg-green-50"
                                            onClick={() =>
                                              handleApprove(member.principal)
                                            }
                                            disabled={approveMember.isPending}
                                            data-ocid={`admin.members.edit_button.${idx + 1}`}
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                            Approve
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 text-red-700 border-red-200 hover:bg-red-50"
                                            onClick={() =>
                                              handleReject(member.principal)
                                            }
                                            disabled={rejectMember.isPending}
                                            data-ocid={`admin.members.delete_button.${idx + 1}`}
                                          >
                                            <XCircle className="w-3.5 h-3.5" />{" "}
                                            Reject
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---- PRODUCTS TAB ---- */}
            <TabsContent value="products">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-display text-xl font-semibold">Products</h2>
                <Dialog
                  open={productDialogOpen}
                  onOpenChange={(open) => {
                    setProductDialogOpen(open);
                    if (!open) resetProductForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2"
                      data-ocid="admin.add_product.open_modal_button"
                    >
                      <Plus className="w-4 h-4" /> Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-lg max-h-[90vh] overflow-y-auto"
                    data-ocid="admin.add_product.dialog"
                  >
                    <DialogHeader>
                      <DialogTitle className="font-display">
                        {editProductId !== null
                          ? "Edit Product"
                          : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label>Product Name *</Label>
                        <Input
                          placeholder="Argan Oil Shampoo"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          data-ocid="admin.product_name.input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Rich nourishing shampoo with..."
                          value={productDesc}
                          onChange={(e) => setProductDesc(e.target.value)}
                          data-ocid="admin.product_desc.textarea"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (₹) *</Label>
                          <Input
                            type="number"
                            placeholder="599"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            data-ocid="admin.product_price.input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Select
                            value={productCategory}
                            onValueChange={setProductCategory}
                          >
                            <SelectTrigger data-ocid="admin.product_category.select">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Image upload section */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <ImagePlus className="w-4 h-4" />
                          Product Images
                        </Label>

                        {/* Existing images (when editing) */}
                        {productExistingImageUrls.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Current images:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {productExistingImageUrls.map((url, i) => (
                                <div key={url} className="relative group">
                                  <img
                                    src={url}
                                    alt={`Product ${i + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setProductExistingImageUrls((prev) =>
                                        prev.filter((_, idx) => idx !== i),
                                      )
                                    }
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New image file input */}
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="cursor-pointer"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            setProductImageFiles(files);
                            setUploadProgress({});
                          }}
                          data-ocid="admin.product_image.upload_button"
                        />

                        {/* New file previews */}
                        {productImageFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              New images to upload ({productImageFiles.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {productImageFiles.map((file, i) => (
                                <div
                                  key={`${file.name}-${i}`}
                                  className="relative"
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-20 h-20 object-cover rounded-lg border"
                                  />
                                  {productImageUploading && (
                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {uploadProgress[i] ?? 0}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 text-xs"
                              onClick={() => {
                                setProductImageFiles([]);
                                setUploadProgress({});
                              }}
                            >
                              Clear new files
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="instock"
                            checked={productInStock}
                            onCheckedChange={(v) => setProductInStock(!!v)}
                            data-ocid="admin.product_instock.checkbox"
                          />
                          <Label htmlFor="instock">In Stock</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="featured"
                            checked={productFeatured}
                            onCheckedChange={(v) => setProductFeatured(!!v)}
                            data-ocid="admin.product_featured.checkbox"
                          />
                          <Label htmlFor="featured">Featured</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProductDialogOpen(false);
                          resetProductForm();
                        }}
                        data-ocid="admin.add_product.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProduct}
                        disabled={
                          addProduct.isPending ||
                          updateProduct.isPending ||
                          productImageUploading
                        }
                        data-ocid="admin.add_product.confirm_button"
                      >
                        {productImageUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            Uploading...
                          </>
                        ) : addProduct.isPending || updateProduct.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : editProductId !== null ? (
                          "Save Changes"
                        ) : (
                          "Add Product"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {productsLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="admin.products.loading_state"
                >
                  {[1, 2, 3].map((_i) => (
                    <Skeleton key={_i} className="h-14 w-full" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Card data-ocid="admin.products.empty_state">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No products yet. Add your first product!
                  </CardContent>
                </Card>
              ) : (
                <div
                  className="overflow-x-auto"
                  data-ocid="admin.products.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, idx) => (
                        <TableRow
                          key={product.id.toString()}
                          data-ocid={`admin.products.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {PRODUCT_CATEGORY_LABELS[
                                getProductCategoryKey(product.category)
                              ] ?? "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            ₹{product.price.toString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={
                                product.inStock
                                  ? "text-green-700"
                                  : "text-muted-foreground"
                              }
                              onClick={() =>
                                toggleStock.mutateAsync(product.id)
                              }
                              disabled={toggleStock.isPending}
                              data-ocid={`admin.products.toggle.${idx + 1}`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={
                                product.featured
                                  ? "text-yellow-600"
                                  : "text-muted-foreground"
                              }
                              onClick={() =>
                                toggleFeatured.mutateAsync(product.id)
                              }
                              disabled={toggleFeatured.isPending}
                              data-ocid={`admin.products.secondary_button.${idx + 1}`}
                            >
                              <Star
                                className={`w-4 h-4 ${product.featured ? "fill-yellow-500" : ""}`}
                              />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditProduct(product)}
                                data-ocid={`admin.products.edit_button.${idx + 1}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveProduct(product.id)}
                                disabled={removeProduct.isPending}
                                data-ocid={`admin.products.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ---- SALONS TAB ---- */}
            <TabsContent value="salons">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-display text-xl font-semibold">
                  Salons & Services
                </h2>
                <div className="flex gap-3">
                  <Dialog
                    open={salonDialogOpen}
                    onOpenChange={setSalonDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        data-ocid="admin.add_salon.open_modal_button"
                      >
                        <Plus className="w-4 h-4" /> Add Salon
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-ocid="admin.add_salon.dialog">
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          Add New Salon
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Salon Name</Label>
                          <Input
                            placeholder="Glamour Studio"
                            value={salonName}
                            onChange={(e) => setSalonName(e.target.value)}
                            data-ocid="admin.salon_name.input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            placeholder="Connaught Place, Delhi"
                            value={salonLocation}
                            onChange={(e) => setSalonLocation(e.target.value)}
                            data-ocid="admin.salon_location.input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Premium beauty salon specializing in..."
                            value={salonDesc}
                            onChange={(e) => setSalonDesc(e.target.value)}
                            data-ocid="admin.salon_desc.textarea"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSalonDialogOpen(false)}
                          data-ocid="admin.add_salon.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddSalon}
                          disabled={addSalon.isPending}
                          data-ocid="admin.add_salon.confirm_button"
                        >
                          {addSalon.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Add Salon"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={serviceDialogOpen}
                    onOpenChange={setServiceDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-2"
                        data-ocid="admin.add_service.open_modal_button"
                      >
                        <Plus className="w-4 h-4" /> Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-ocid="admin.add_service.dialog">
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          Add New Service
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Salon</Label>
                          <Select
                            value={serviceSalonId}
                            onValueChange={setServiceSalonId}
                          >
                            <SelectTrigger data-ocid="admin.service_salon.select">
                              <SelectValue placeholder="Choose a salon" />
                            </SelectTrigger>
                            <SelectContent>
                              {salons.map((s) => (
                                <SelectItem
                                  key={s.id.toString()}
                                  value={s.id.toString()}
                                >
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Service Name</Label>
                          <Input
                            placeholder="Deep Conditioning Treatment"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            data-ocid="admin.service_name.input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Nourishing hair treatment for..."
                            value={serviceDesc}
                            onChange={(e) => setServiceDesc(e.target.value)}
                            data-ocid="admin.service_desc.textarea"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={serviceCategory}
                            onValueChange={setServiceCategory}
                          >
                            <SelectTrigger data-ocid="admin.service_category.select">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {SERVICE_CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setServiceDialogOpen(false)}
                          data-ocid="admin.add_service.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddService}
                          disabled={addService.isPending}
                          data-ocid="admin.add_service.confirm_button"
                        >
                          {addService.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Add Service"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {salons.length === 0 ? (
                <Card data-ocid="admin.salons.empty_state">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No salons yet. Add your first partner salon!
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {salons.map((salon, sIdx) => (
                    <Card
                      key={salon.id.toString()}
                      data-ocid={`admin.salons.item.${sIdx + 1}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="font-display text-lg">
                              {salon.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {salon.location}
                            </p>
                            {salon.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {salon.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                            onClick={() => handleRemoveSalon(salon.id)}
                            disabled={removeSalon.isPending}
                            data-ocid={`admin.salons.delete_button.${sIdx + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {services.filter((s) => s.salonId === salon.id)
                          .length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No services added yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {services
                              .filter((s) => s.salonId === salon.id)
                              .map((svc, svIdx) => (
                                <div
                                  key={svc.id.toString()}
                                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/40"
                                  data-ocid={`admin.services.item.${svIdx + 1}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-sm">
                                      {svc.name}
                                    </span>
                                    {svc.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {svc.description}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10 flex-shrink-0 w-8 h-8"
                                    onClick={() => handleRemoveService(svc.id)}
                                    disabled={removeService.isPending}
                                    data-ocid={`admin.services.delete_button.${svIdx + 1}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ---- ORDERS TAB ---- */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    All Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((_i) => (
                        <Skeleton key={_i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      No orders placed yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...orders]
                            .sort(
                              (a, b) => Number(b.placedAt) - Number(a.placedAt),
                            )
                            .map((order, idx) => (
                              <TableRow
                                key={order.id.toString()}
                                data-ocid={`admin.orders.row.${idx + 1}`}
                              >
                                <TableCell className="font-mono text-xs font-medium text-primary">
                                  {order.orderId}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {order.customerName}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {order.customerPhone}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs max-w-[200px]">
                                  <div>{order.customerAddress}</div>
                                  <div className="text-xs opacity-70">
                                    Pin: {order.customerPincode}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-0.5">
                                    {order.items.map((item) => (
                                      <div
                                        key={item.productId.toString()}
                                        className="text-xs text-muted-foreground"
                                      >
                                        {item.productName} ×
                                        {item.quantity.toString()} @ ₹
                                        {item.price.toString()}
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold text-primary">
                                  ₹{order.totalAmount.toString()}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {new Date(
                                    Number(order.placedAt / 1_000_000n),
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
