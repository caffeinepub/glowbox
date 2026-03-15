import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Hand,
  MoreHorizontal,
  Package,
  Palette,
  Scissors,
  Sparkles,
  Wand2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type {
  MemberProfile,
  MemberStatus,
  SalonService,
  ServiceCategory,
} from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import {
  useGetAllSalons,
  useGetApprovedServices,
  useGetMyProfile,
  useIsAdmin,
} from "../hooks/useQueries";

function getStatusInfo(status: MemberStatus) {
  if ("pending_payment" in status) {
    return {
      label: "Pending Payment",
      color: "bg-accent/20 text-accent-foreground border-accent/30",
      icon: Clock,
      message: "Complete your payment of ₹535 to proceed with your membership.",
      action: "Complete Payment",
      actionPath: "/onboard" as const,
    };
  }
  if ("pending_inspection" in status) {
    return {
      label: "Under Inspection",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Package,
      message:
        "We've received your box! Our experts are inspecting your hair sample. This takes 2-3 business days.",
      action: null,
      actionPath: null,
    };
  }
  if ("approved" in status) {
    return {
      label: "Approved ✨",
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
      message:
        "Congratulations! You're approved. Explore your complimentary services below.",
      action: null,
      actionPath: null,
    };
  }
  return {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
    message:
      "Unfortunately your hair sample didn't meet the requirements. Please contact support at help@focliy.in.",
    action: null,
    actionPath: null,
  };
}

function getCategoryInfo(cat: ServiceCategory) {
  if ("haircare" in cat)
    return {
      label: "Hair Care",
      icon: Scissors,
      color: "bg-primary/10 text-primary",
    };
  if ("skincare" in cat)
    return {
      label: "Skin Care",
      icon: Sparkles,
      color: "bg-pink-100 text-pink-700",
    };
  if ("makeup" in cat)
    return {
      label: "Makeup",
      icon: Palette,
      color: "bg-purple-100 text-purple-700",
    };
  if ("nails" in cat)
    return {
      label: "Nails",
      icon: Hand,
      color: "bg-accent/20 text-accent-foreground",
    };
  return {
    label: "Other",
    icon: MoreHorizontal,
    color: "bg-muted text-muted-foreground",
  };
}

function ServiceCard({
  service,
  salonName,
  index,
}: { service: SalonService; salonName: string; index: number }) {
  const cat = getCategoryInfo(service.category);
  const CatIcon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`services.item.${index + 1}`}
    >
      <Card className="h-full hover:shadow-rose transition-all duration-200">
        <CardContent className="pt-5 pb-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-base leading-snug">
              {service.name}
            </h3>
            <Badge
              className={`${cat.color} border text-xs flex-shrink-0 gap-1`}
            >
              <CatIcon className="w-3 h-3" />
              {cat.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {service.description}
          </p>
          <div className="text-xs text-primary font-medium mt-auto">
            {salonName}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading: profileLoading } = useGetMyProfile();
  const profile = data as MemberProfile | null | undefined;
  const { data: services = [] } = useGetApprovedServices();
  const { data: salons = [] } = useGetAllSalons();
  const { data: isAdmin } = useIsAdmin();

  if (!identity) {
    navigate({ to: "/auth" });
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div
            className="container max-w-4xl space-y-6"
            data-ocid="dashboard.loading_state"
          >
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    navigate({ to: "/onboard" });
    return null;
  }

  const statusInfo = getStatusInfo(profile.status);
  const StatusIcon = statusInfo.icon;
  const isApproved = "approved" in profile.status;

  const servicesBySalon = salons
    .map((salon) => ({
      salon,
      services: services.filter((s) => s.salonId === salon.id),
    }))
    .filter((g) => g.services.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-4xl">
          <motion.div
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="font-display text-3xl font-bold">
                Welcome back, {profile.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's your Focliy membership overview.
              </p>
            </div>
            {isAdmin && (
              <Link to="/admin" data-ocid="dashboard.admin.link">
                <Button variant="outline" size="sm" className="gap-2">
                  <Wand2 className="w-4 h-4" /> Admin Panel
                </Button>
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card
              className="border-2 border-border shadow-rose"
              data-ocid="dashboard.status.card"
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <StatusIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-display text-xl font-semibold">
                        Membership Status
                      </h2>
                      <Badge className={`${statusInfo.color} border text-xs`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      {statusInfo.message}
                    </p>
                    {statusInfo.action && statusInfo.actionPath && (
                      <Link
                        to={statusInfo.actionPath}
                        className="mt-3 inline-block"
                      >
                        <Button
                          size="sm"
                          className="gap-2 mt-1"
                          data-ocid="dashboard.status.primary_button"
                        >
                          {statusInfo.action} <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { label: "Name", value: profile.name },
              { label: "Phone", value: profile.phone },
              {
                label: "Payment",
                value: profile.paymentConfirmed ? "Confirmed ✓" : "Pending",
              },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="font-medium mt-1 text-sm">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {isApproved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold">
                  Your Free Services
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Complimentary services available at partner salons.
                </p>
              </div>

              {services.length === 0 ? (
                <Card data-ocid="services.empty_state">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Scissors className="w-10 h-10 mx-auto mb-4 opacity-40" />
                    <p>No services available yet. Check back soon!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {servicesBySalon.map((group) => (
                    <div key={group.salon.id.toString()}>
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="font-display text-lg font-semibold">
                          {group.salon.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {group.salon.location}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {group.services.map((svc, idx) => (
                          <ServiceCard
                            key={svc.id.toString()}
                            service={svc}
                            salonName={group.salon.name}
                            index={idx}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
