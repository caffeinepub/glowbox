import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Sparkles, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { signOut, isAuthenticated, userEmail } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const displayEmail = userEmail
    ? userEmail.length > 20
      ? `${userEmail.slice(0, 17)}...`
      : userEmail
    : null;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link
          to="/"
          data-ocid="nav.link"
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            Focliy
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              data-ocid="nav.dashboard.link"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated ? (
            <>
              {displayEmail && (
                <span className="hidden sm:block text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              )}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                data-ocid="nav.logout.button"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate({ to: "/auth" })}
              size="sm"
              data-ocid="nav.login.button"
              className="gap-2"
            >
              <User className="w-4 h-4" /> Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
