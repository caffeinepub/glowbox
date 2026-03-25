import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductCategory } from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { useGetProductById } from "../hooks/useQueries";

const CATEGORY_LABELS: Record<string, string> = {
  hair_care: "Hair Care",
  shampoo: "Shampoo",
  conditioner: "Conditioner",
  skin_care: "Skin Care",
  makeup: "Makeup",
  accessories: "Accessories",
  nail_care: "Nail Care",
  facewash: "Facewash",
  other: "Other",
};

function getCategoryKey(cat: ProductCategory): string {
  return Object.keys(cat)[0];
}

export default function ProductPage() {
  const { id } = useParams({ from: "/shop/$id" });
  const productId = BigInt(id);
  const { data: product, isLoading } = useGetProductById(productId);
  const { addItem } = useCart();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      description: "View your cart to checkout.",
    });
  };

  const imageUrls = product?.imageUrl
    ? product.imageUrl.split("|").filter(Boolean)
    : [];
  const activeImage = imageUrls[activeImageIdx] || null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10 max-w-4xl mx-auto">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          data-ocid="product.back.link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        {isLoading ? (
          <div
            className="grid md:grid-cols-2 gap-10"
            data-ocid="product.loading_state"
          >
            <Skeleton className="h-80 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ) : !product ? (
          <div className="py-20 text-center" data-ocid="product.error_state">
            <Package className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-2xl font-semibold mb-2">
              Product Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              This product doesn&apos;t exist or has been removed.
            </p>
            <Link to="/shop">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-10"
          >
            {/* Image gallery */}
            <div className="space-y-3">
              {activeImage ? (
                <div className="rounded-2xl overflow-hidden bg-muted aspect-square">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center aspect-square">
                  <Package className="w-20 h-20 text-primary/20" />
                </div>
              )}
              {/* Thumbnails for multiple images */}
              {imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImageIdx(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        activeImageIdx === i
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                      data-ocid={`product.image_thumb.${i + 1}`}
                    >
                      <img
                        src={url}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
                    {product.name}
                  </h1>
                  {product.featured && (
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-1" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {CATEGORY_LABELS[getCategoryKey(product.category)] ??
                      "Other"}
                  </Badge>
                  {product.inStock ? (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Out of Stock
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-0">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-4xl font-bold text-primary">
                ₹{product.price.toString()}
              </p>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                data-ocid="product.add_to_cart.button"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
