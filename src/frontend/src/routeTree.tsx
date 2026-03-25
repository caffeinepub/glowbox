import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import OnboardPage from "./pages/OnboardPage";
import ProductPage from "./pages/ProductPage";
import ShopPage from "./pages/ShopPage";
import TermsPage from "./pages/TermsPage";

function RootLayout() {
  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const onboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboard",
  component: OnboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop/$id",
  component: ProductPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  dashboardRoute,
  onboardRoute,
  adminRoute,
  shopRoute,
  productRoute,
  termsRoute,
  cartRoute,
]);
