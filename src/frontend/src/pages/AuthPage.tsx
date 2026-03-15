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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

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

  if (isAuthenticated) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("[Focliy] handleSignIn error:", err);
      toast.error("Invalid credentials or account not found");
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
      await signUp(email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("[Focliy] handleSignIn error:", err);
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
              <Tabs defaultValue="signin" className="w-full">
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
                          <Label htmlFor="signin-password">Password</Label>
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
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By signing up you agree to our{" "}
                <Link to="/" className="underline">
                  terms
                </Link>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
