import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const { signOut, isAuthenticated, userEmail } = useAuth();
  const { count } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    queryClient.clear();
    navigate({ to: "/" });
    setMobileOpen(false);
  };

  const displayEmail = userEmail
    ? userEmail.length > 20
      ? `${userEmail.slice(0, 17)}...`
      : userEmail
    : null;

  const navLinks = [
    { label: "Products", href: "/shop", isRouter: true },
    { label: "Services", href: "/#services", isRouter: false },
    { label: "Contact", href: "/#contact", isRouter: false },
    { label: "Terms & Conditions", href: "/terms", isRouter: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          data-ocid="nav.link"
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            Focliy
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) =>
            link.isRouter ? (
              <Link
                key={link.href}
                to={link.href}
                data-ocid="nav.link"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                data-ocid="nav.link"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </a>
            ),
          )}

          <Link
            to="/shop"
            data-ocid="nav.shop.link"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop</span>
          </Link>

          {/* Cart icon with badge */}
          <Link
            to="/cart"
            data-ocid="nav.cart.link"
            className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

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
                <span className="text-xs text-muted-foreground">
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

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile cart icon */}
          <Link
            to="/cart"
            data-ocid="nav.cart.link"
            className="relative p-1.5 text-muted-foreground hover:text-foreground"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              data-ocid="nav.logout.button"
              className="gap-1 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => navigate({ to: "/auth" })}
              size="sm"
              data-ocid="nav.login.button"
              className="gap-1 text-xs"
            >
              <User className="w-3.5 h-3.5" /> Sign In
            </Button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.isRouter ? (
                <Link
                  key={link.href}
                  to={link.href}
                  data-ocid="nav.link"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium py-2 px-1 rounded"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid="nav.link"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium py-2 px-1 rounded"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                data-ocid="nav.dashboard.link"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium py-2 px-1 rounded"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
