import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductCategory } from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { useGetAllProducts } from "../hooks/useQueries";

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

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "hair_care", label: "Hair Care" },
  { key: "shampoo", label: "Shampoo" },
  { key: "conditioner", label: "Conditioner" },
  { key: "skin_care", label: "Skin Care" },
  { key: "makeup", label: "Makeup" },
  { key: "accessories", label: "Accessories" },
  { key: "nail_care", label: "Nail Care" },
  { key: "facewash", label: "Facewash" },
];

export default function ShopPage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const { addItem } = useCart();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => getCategoryKey(p.category) === activeFilter);

  const handleAddToCart = (product: (typeof products)[0]) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      description: "View your cart to checkout.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-16 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                <ShoppingBag className="w-4 h-4" />
                Premium Beauty Products
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Shop Focliy
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Discover our curated collection of premium hair care and beauty
                products, hand-picked for exceptional results.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="container py-6">
          <div className="flex flex-wrap gap-2" data-ocid="shop.filter.tab">
            {FILTER_TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                data-ocid={`shop.${tab.key}.tab`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeFilter === tab.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="container pb-16">
          {isLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="shop.loading_state"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center" data-ocid="shop.empty_state">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-lg">
                {activeFilter === "all"
                  ? "No products available yet. Check back soon!"
                  : `No products in ${CATEGORY_LABELS[activeFilter] ?? activeFilter} yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, idx) => {
                const imageUrls = product.imageUrl
                  ? product.imageUrl.split("|")
                  : [];
                const firstImage = imageUrls[0] || null;
                return (
                  <motion.div
                    key={product.id.toString()}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    data-ocid={`shop.item.${idx + 1}`}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                      {firstImage ? (
                        <div className="h-48 overflow-hidden bg-muted">
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-semibold text-foreground leading-tight">
                            {product.name}
                          </h3>
                          {product.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORY_LABELS[
                              getCategoryKey(product.category)
                            ] ?? "Other"}
                          </Badge>
                          {product.inStock ? (
                            <Badge className="text-xs bg-green-100 text-green-700 border-0">
                              In Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              Out of Stock
                            </Badge>
                          )}
                          {product.featured && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-700 border-0">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 pb-2">
                        <p className="text-xl font-bold text-primary">
                          ₹{product.price.toString()}
                        </p>
                      </CardContent>
                      <CardFooter className="gap-2 flex">
                        <Link
                          to="/shop/$id"
                          params={{ id: product.id.toString() }}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            className="w-full"
                            data-ocid={`shop.view_button.${idx + 1}`}
                          >
                            View Details
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          disabled={!product.inStock}
                          onClick={() => handleAddToCart(product)}
                          data-ocid={`shop.add_to_cart.${idx + 1}`}
                          title="Add to cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
