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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Copy, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import {
  useConfirmPayment,
  useGetMyProfile,
  useRegisterMember,
} from "../hooks/useQueries";

const UPI_ID = "focliy@upi";
const UPI_NAME = "Focliy";
const AMOUNT = "535";

function generateRefId(name: string, phone: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const namePart = name.replace(/\s+/g, "").slice(0, 5).toUpperCase();
  const phonePart = phone.replace(/\D/g, "").slice(-4);
  return `FOCLIY-${namePart}${phonePart}-${ts}`;
}

export default function OnboardPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetMyProfile();
  const registerMember = useRegisterMember();
  const confirmPayment = useConfirmPayment();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="onboard.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const ok = await registerMember.mutateAsync({ name, phone, address });
      if (ok) {
        setRegisteredName(name);
        setRegisteredPhone(phone);
        setStep("payment");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const ok = await confirmPayment.mutateAsync();
      if (ok) {
        toast.success(
          "Payment confirmed! We'll review and send your box shortly.",
        );
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Could not confirm payment. Please contact support.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied!");
  };

  const copyRef = () => {
    navigator.clipboard.writeText(refId);
    toast.success("Reference ID copied!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">
              Welcome to Focliy
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete your membership registration below.
            </p>
          </motion.div>

          {step === "form" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-rose">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Your Details
                  </CardTitle>
                  <CardDescription>
                    We need a few details to process your membership and ship
                    your Focliy box.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-ocid="onboard.name.input"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        data-ocid="onboard.phone.input"
                        autoComplete="tel"
                        type="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Flat 4B, Rose Gardens, MG Road, Bangalore - 560001"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        data-ocid="onboard.address.textarea"
                        rows={3}
                        autoComplete="street-address"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-5 font-semibold shadow-rose"
                      disabled={registerMember.isPending}
                      data-ocid="onboard.submit_button"
                    >
                      {registerMember.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Registering...
                        </>
                      ) : (
                        "Continue to Payment"
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
              <Card className="shadow-rose">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Complete Your Payment
                  </CardTitle>
                  <CardDescription>
                    Scan the QR code below with any UPI app to pay ₹535 and
                    activate your Focliy membership.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4 bg-secondary/50 rounded-xl p-6">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <QRCodeSVG
                        value={upiLink}
                        size={200}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Scan with GPay, PhonePe, Paytm or BHIM
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="font-display text-lg font-bold text-foreground">
                          {UPI_ID}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyUPI}
                          data-ocid="onboard.copy.button"
                          className="w-7 h-7"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-xl font-bold text-primary">₹535</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Your Payment Reference ID
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-background border border-border rounded-lg px-3 py-2 text-foreground break-all">
                        {refId}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyRef}
                        data-ocid="onboard.copy_ref.button"
                        className="flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This ID is automatically included in the QR code. You can
                      also add it manually in the payment remarks so we can
                      verify your payment faster.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Scan the QR code or open your UPI app and search for{" "}
                        <strong>{UPI_ID}</strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Send exactly <strong>₹535</strong> — the reference ID is
                        auto-filled in the remarks
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Click the button below once payment is done</span>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    className="w-full py-5 font-semibold shadow-rose"
                    onClick={handleConfirmPayment}
                    disabled={confirmPayment.isPending}
                    data-ocid="onboard.confirm_payment.button"
                  >
                    {confirmPayment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Confirming...
                      </>
                    ) : (
                      "I've Paid ✓"
                    )}
                  </Button>
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
