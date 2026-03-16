import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { createActorWithConfig } from "../config";
import { deriveIdentity, useAuth } from "../hooks/useAuth";

const decorativeFeatures = [
  { icon: "✨", text: "Access premium beauty services", delay: 0.3 },
  { icon: "💅", text: "Facials, mani-pedi, waxing & more", delay: 0.45 },
  { icon: "🌸", text: "Partner salons across India", delay: 0.6 },
  { icon: "🎁", text: "Unlimited services after approval", delay: 0.75 },
];

export default function AuthPage() {
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [forgotOpen, setForgotOpen] = useState(false);

  if (isAuthenticated) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("[Focliy] signIn: checking email", normalizedEmail);

      // Step 1: Check if email is registered (anonymous call)
      const anonActor = await createActorWithConfig();
      const exists = await anonActor.emailExists(normalizedEmail);

      if (!exists) {
        console.log("[Focliy] signIn: email not found");
        toast.error(
          "You are not registered yet. Please create an account first.",
        );
        setActiveTab("signup");
        return;
      }

      // Step 2: Derive identity and verify password by calling createAccount (idempotent)
      const derivedId = await deriveIdentity(email, password);
      const authActor = await createActorWithConfig({
        agentOptions: { identity: derivedId },
      });

      console.log(
        "[Focliy] signIn: verifying password, principal:",
        derivedId.getPrincipal().toString(),
      );
      const passwordCorrect = await authActor.createAccount(normalizedEmail);

      if (!passwordCorrect) {
        console.log("[Focliy] signIn: wrong password for", normalizedEmail);
        toast.error("Incorrect password. Please try again.");
        return;
      }

      // Step 3: Refresh role (ensures admin role is applied after canister upgrades)
      try {
        await authActor.refreshAccountRole(normalizedEmail);
        console.log("[Focliy] signIn: role refreshed for", normalizedEmail);
      } catch (roleErr) {
        console.warn(
          "[Focliy] signIn: role refresh failed (non-fatal)",
          roleErr,
        );
      }

      console.log("[Focliy] signIn: SUCCESS for", normalizedEmail);
      await signIn(email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("[Focliy] handleSignIn error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const anonActor = await createActorWithConfig();
      const exists = await anonActor.emailExists(normalizedEmail);
      if (exists) {
        toast.error(
          "An account with this email already exists. Please sign in.",
        );
        setActiveTab("signin");
        return;
      }

      const derivedId = await deriveIdentity(email, password);
      const authActor = await createActorWithConfig({
        agentOptions: { identity: derivedId },
      });
      const registered = await authActor.createAccount(normalizedEmail);
      if (!registered) {
        toast.error("Could not create account. Please try again.");
        return;
      }

      await signUp(email, password);
      console.log(
        "[Focliy] signUp SUCCESS. email:",
        normalizedEmail,
        "principal:",
        derivedId.getPrincipal().toString(),
      );
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("[Focliy] handleSignUp error:", err);
      toast.error("Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left branding */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:block"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
                <span className="font-display text-2xl font-bold text-primary">
                  Focliy
                </span>
              </div>
              <h2 className="font-display text-4xl font-bold leading-tight mb-4">
                Beauty services,{" "}
                <span className="text-primary">reimagined</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of women enjoying complimentary salon services
                with a Focliy membership.
              </p>
              <ul className="space-y-4">
                {decorativeFeatures.map((f) => (
                  <motion.li
                    key={f.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: f.delay }}
                    className="flex items-center gap-3 text-base"
                  >
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-semibold">
                    Annual membership: ₹535 only
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  One-time payment. Hair sample inspection required.
                </p>
              </div>
            </motion.div>

            {/* Right auth card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full mb-6" data-ocid="auth.tab">
                  <TabsTrigger value="signin" className="flex-1">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1">
                    Create Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display text-xl">
                        Welcome back
                      </CardTitle>
                      <CardDescription>
                        Sign in to your Focliy account.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            data-ocid="auth.signin.email.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="signin-password">Password</Label>
                            <button
                              type="button"
                              onClick={() => setForgotOpen(true)}
                              className="text-xs text-primary hover:underline"
                              data-ocid="auth.forgot_password.button"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-ocid="auth.signin.password.input"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loading}
                          data-ocid="auth.signin.submit_button"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                          Don't have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setActiveTab("signup")}
                            className="text-primary hover:underline font-medium"
                          >
                            Create one
                          </button>
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="signup">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-display text-xl">
                        Join Focliy
                      </CardTitle>
                      <CardDescription>
                        Create your account to get started.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            data-ocid="auth.signup.email.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-ocid="auth.signup.password.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-confirm">
                            Confirm Password
                          </Label>
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            data-ocid="auth.signup.confirm.input"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loading}
                          data-ocid="auth.signup.submit_button"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setActiveTab("signin")}
                            className="text-primary hover:underline font-medium"
                          >
                            Sign in
                          </button>
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent data-ocid="auth.forgot_password.dialog">
          <DialogHeader>
            <DialogTitle>Recover Your Password</DialogTitle>
            <DialogDescription>
              Since your password is used to generate your account key, it
              cannot be reset automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              To recover access to your account, please contact our support team
              with your registered email address. We will verify your identity
              and help you regain access.
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium text-foreground">Contact Support</p>
              <p>
                Email: <span className="text-primary">support@focliy.com</span>
              </p>
            </div>
            <p className="text-xs">
              Note: If you cannot remember your password and do not wish to
              contact support, you may create a new account with the same email.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setForgotOpen(false)}
            className="w-full"
            data-ocid="auth.forgot_password.close_button"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
