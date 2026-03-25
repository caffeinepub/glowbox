import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand4 = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `ORD-${rand4()}-${rand4()}`;
}

const UPI_ID = "9910926329@idfcfirst";
const UPI_NAME = "Focliy";

function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=8`;
  return (
    <img
      src={url}
      alt="UPI QR Code"
      width={size}
      height={size}
      className="rounded-xl border border-border shadow-sm"
    />
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, count } =
    useCart();
  const { actor } = useActor();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !pincode.trim())
      return;
    setSubmitting(true);
    const id = generateOrderId();
    const currentTotal = total;
    try {
      if (actor) {
        const orderItems = items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: BigInt(item.quantity),
          price: item.product.price,
        }));
        await actor.placeOrder(
          id,
          name.trim(),
          phone.trim(),
          address.trim(),
          pincode.trim(),
          orderItems,
          BigInt(currentTotal),
        );
        console.log("[Focliy] Order placed successfully:", id);
      }
    } catch (e) {
      console.error("[Focliy] Order save error:", e);
    }
    setOrderId(id);
    setOrderTotal(currentTotal);
    clearCart();
    setSubmitting(false);
  };

  const formValid =
    name.trim() && phone.trim() && address.trim() && pincode.trim();

  const upiLink = orderId
    ? `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${orderTotal}&cu=INR&tn=${encodeURIComponent(orderId)}`
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl font-bold mb-2">Your Cart</h1>
          <p className="text-muted-foreground mb-8">
            {count > 0
              ? `${count} item${count !== 1 ? "s" : ""} in your cart`
              : "Your cart is empty"}
          </p>

          {/* Success state */}
          <AnimatePresence>
            {orderId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8"
                data-ocid="cart.success_state"
              >
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="py-8 text-center space-y-4">
                    <CheckCircle2 className="w-14 h-14 mx-auto text-green-600" />
                    <h2 className="font-display text-2xl font-bold text-green-800">
                      Order Placed!
                    </h2>
                    <p className="text-green-700 font-medium text-lg">
                      Order ID:{" "}
                      <span className="font-mono font-bold">{orderId}</span>
                    </p>
                    <Separator className="my-2" />
                    <div className="bg-white rounded-xl p-5 max-w-sm mx-auto border border-green-200 space-y-4">
                      <p className="font-semibold text-foreground">
                        Scan to Pay via UPI
                      </p>
                      <div className="flex justify-center">
                        <QRCode value={upiLink} size={200} />
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground text-left">
                        <p>
                          UPI ID:{" "}
                          <span className="font-mono font-medium text-foreground">
                            {UPI_ID}
                          </span>
                        </p>
                        <p>
                          Amount:{" "}
                          <span className="font-bold text-primary">
                            ₹{orderTotal.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-amber-700 font-medium">
                          Remark: <span className="font-mono">{orderId}</span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use <strong>{orderId}</strong> as the payment remark so
                        we can match your payment.
                      </p>
                    </div>
                    <Link to="/shop">
                      <Button variant="outline" className="mt-2">
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!orderId && items.length === 0 && (
            <div className="py-20 text-center" data-ocid="cart.empty_state">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add some products to get started
              </p>
              <Link to="/shop">
                <Button data-ocid="cart.shop.link">Browse Products</Button>
              </Link>
            </div>
          )}

          {/* Cart items + checkout */}
          {!orderId && items.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Items */}
              <div className="md:col-span-2 space-y-4" data-ocid="cart.list">
                <AnimatePresence>
                  {items.map((item, idx) => {
                    const imageUrls = item.product.imageUrl
                      ? item.product.imageUrl.split("|")
                      : [];
                    const firstImage = imageUrls[0] || null;
                    return (
                      <motion.div
                        key={item.product.id.toString()}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.25 }}
                        data-ocid={`cart.item.${idx + 1}`}
                      >
                        <Card>
                          <CardContent className="p-4 flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {item.product.name}
                              </p>
                              <p className="text-primary font-bold mt-0.5">
                                ₹{item.product.price.toString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                data-ocid={`cart.minus.${idx + 1}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                data-ocid={`cart.plus.${idx + 1}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.product.id)}
                                className="w-8 h-8 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-1"
                                data-ocid={`cart.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Order summary + form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg">
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.product.id.toString()}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground truncate mr-2">
                          {item.product.name} ×{item.quantity}
                        </span>
                        <span className="font-medium flex-shrink-0">
                          ₹
                          {(
                            Number(item.product.price) * item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout form */}
                <Card data-ocid="cart.dialog">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg">
                      Delivery Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-ocid="cart.name.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        data-ocid="cart.phone.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Address</Label>
                      <Input
                        placeholder="123 Main St, City"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        data-ocid="cart.address.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pincode</Label>
                      <Input
                        placeholder="110001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        data-ocid="cart.pincode.input"
                      />
                    </div>
                    <Button
                      className="w-full gap-2"
                      disabled={!formValid || submitting}
                      onClick={handlePlaceOrder}
                      data-ocid="cart.submit_button"
                    >
                      {submitting ? "Placing Order..." : "Place Order"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Pay via UPI after placing order
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
