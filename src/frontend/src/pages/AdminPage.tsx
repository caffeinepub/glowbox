import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  Package,
  Plus,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MemberStatus, ServiceCategory } from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import {
  useAdminAddSalon,
  useAdminAddService,
  useAdminApproveMember,
  useAdminConfirmPayment,
  useAdminGetAllMembers,
  useAdminMarkHairSamplesReceived,
  useAdminRejectMember,
  useAdminRemoveSalon,
  useAdminRemoveService,
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

export default function AdminPage() {
  const { identity, isInitializing } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: members = [], isLoading: membersLoading } =
    useAdminGetAllMembers();
  const { data: salons = [] } = useGetAllSalons();
  const { data: services = [] } = useGetApprovedServices();

  const confirmPaymentAdmin = useAdminConfirmPayment();
  const markSamplesReceived = useAdminMarkHairSamplesReceived();
  const approveMember = useAdminApproveMember();
  const rejectMember = useAdminRejectMember();
  const addSalon = useAdminAddSalon();
  const addService = useAdminAddService();
  const removeSalon = useAdminRemoveSalon();
  const removeService = useAdminRemoveService();

  const [salonDialogOpen, setSalonDialogOpen] = useState(false);
  const [salonName, setSalonName] = useState("");
  const [salonLocation, setSalonLocation] = useState("");
  const [salonDesc, setSalonDesc] = useState("");

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceSalonId, setServiceSalonId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");

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
              You don't have admin privileges.
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
              Manage members and salon services.
            </p>
          </motion.div>

          <Tabs defaultValue="members">
            <TabsList className="mb-6">
              <TabsTrigger value="members" data-ocid="admin.members.tab">
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="salons" data-ocid="admin.salons.tab">
                Salons & Services ({salons.length})
              </TabsTrigger>
            </TabsList>

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
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
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
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
