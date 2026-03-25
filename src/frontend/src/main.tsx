import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// IMPORTANT: Do NOT use InternetIdentityProvider here ever.
// This app uses AuthProvider and useAuth exclusively.
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {/* IMPORTANT: AuthProvider must wrap everything. Never replace with InternetIdentityProvider. */}
    <AuthProvider>
      {/* IMPORTANT: CartProvider must wrap everything so useCart works everywhere. */}
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>,
);
