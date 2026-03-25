import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Copy, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";
import {
  useConfirmPayment,
  useGetMyProfile,
  useRegisterMember,
} from "../hooks/useQueries";

const UPI_ID = "9910926329@idfcfirst";
const UPI_NAME = "Focliy";
const AMOUNT = "799";

function generateRefId(name: string, phone: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const namePart = name.replace(/\s+/g, "").slice(0, 5).toUpperCase();
  const phonePart = phone.replace(/\D/g, "").slice(-4);
  return `FOCLIY-${namePart}${phonePart}-${ts}`;
}

function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=8`;
  return (
    <img
      src={url}
      alt="UPI QR Code"
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}

export default function OnboardPage() {
  const { identity } = useAuth();
  const { actor, isFetching: isActorLoading } = useActor();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetMyProfile();
  const registerMember = useRegisterMember();
  const confirmPayment = useConfirmPayment();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [zip, setZip] = useState("");

  const [step, setStep] = useState<"form" | "payment">("form");
  const [registeredName, setRegisteredName] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState("");

  const refId = useMemo(
    () =>
      registeredName && registeredPhone
        ? generateRefId(registeredName, registeredPhone)
        : "",
    [registeredName, registeredPhone],
  );

  const upiLink = useMemo(
    () =>
      `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(refId)}`,
    [refId],
  );

  if (!identity) {
    navigate({ to: "/auth" });
    return null;
  }

  if (isLoading || isActorLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="onboard.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If payment already submitted or beyond, go to dashboard
  if (
    profile &&
    ("payment_submitted" in profile.status ||
      "waiting_hair_samples" in profile.status ||
      "hair_samples_received" in profile.status ||
      "approved" in profile.status)
  ) {
    navigate({ to: "/dashboard" });
    return null;
  }

  // If registered but payment pending, jump to payment step
  if (profile && step === "form") {
    setStep("payment");
    setRegisteredName(profile.name);
    setRegisteredPhone(profile.phone);
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zip.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Still loading, please wait a moment and try again.");
      return;
    }
    const fullAddress = `${addressLine}, ${city}, ${state} - ${zip}`;
    try {
      console.log(
        "[Focliy] Calling registerMember, actor principal:",
        identity.getPrincipal().toString(),
      );
      const ok = await registerMember.mutateAsync({
        name,
        phone,
        address: fullAddress,
      });
      console.log("[Focliy] registerMember result:", ok);
      if (ok) {
        setRegisteredName(name);
        setRegisteredPhone(phone);
        setStep("payment");
      } else {
        toast.error("Registration failed. You may already be registered.");
      }
    } catch (err) {
      console.error("[Focliy] registerMember error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!actor) {
      toast.error("Still loading, please wait a moment and try again.");
      return;
    }
    try {
      const ok = await confirmPayment.mutateAsync(refId);
      if (ok) {
        toast.success(
          "Payment submitted! Our team will verify it within 1-2 business days.",
        );
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Could not submit payment. Please try again.");
      }
    } catch (err) {
      console.error("[Focliy] confirmPayment error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-lg">
          {step === "form" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h1 className="font-display text-3xl font-bold">
                  Complete Your Profile
                </h1>
                <p className="text-muted-foreground mt-2">
                  Fill in your details to proceed with membership.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Personal Details
                  </CardTitle>
                  <CardDescription>
                    This information will be used for your membership and hair
                    sample delivery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Priya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          data-ocid="onboard.name.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          data-ocid="onboard.phone.input"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address">Address Line *</Label>
                      <Input
                        id="address"
                        placeholder="House No., Street, Area"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        required
                        data-ocid="onboard.address.input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          data-ocid="onboard.city.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          data-ocid="onboard.state.input"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="zip">ZIP / Postal Code *</Label>
                      <Input
                        id="zip"
                        placeholder="400001"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                        data-ocid="onboard.zip.input"
                      />
                    </div>

                    <Separator className="my-2" />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMember.isPending || !actor}
                      data-ocid="onboard.register.submit_button"
                    >
                      {registerMember.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Continue to Payment →"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8 text-center">
                <h1 className="font-display text-3xl font-bold">Pay ₹799</h1>
                <p className="text-muted-foreground mt-2">
                  Scan the QR code below to complete your membership payment.
                </p>
              </div>

              <Card>
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col items-center gap-6">
                    <div className="p-3 bg-white rounded-xl border shadow-sm">
                      <QRCode value={upiLink} size={220} />
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-4 py-3">
                        <span className="text-muted-foreground">UPI ID</span>
                        <span className="font-medium">{UPI_ID}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-4 py-3">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">₹{AMOUNT}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-4 py-3 gap-2">
                        <span className="text-muted-foreground flex-shrink-0">
                          Reference ID
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs truncate">
                            {refId}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(refId);
                              toast.success("Reference ID copied!");
                            }}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                            data-ocid="payment.refid.button"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      After paying, click the button below. Our team will verify
                      your payment within 1-2 business days.
                    </p>

                    <Button
                      className="w-full gap-2"
                      onClick={handleConfirmPayment}
                      disabled={confirmPayment.isPending || !actor}
                      data-ocid="payment.confirm.primary_button"
                    >
                      {confirmPayment.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> I Have Paid
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
