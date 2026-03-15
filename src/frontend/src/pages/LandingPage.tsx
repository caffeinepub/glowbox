import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Heart,
  Package,
  Scissors,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

const steps = [
  {
    icon: ShieldCheck,
    step: "01",
    title: "Sign Up & Pay",
    desc: "Become a member for just ₹535/year. A small investment for a lifetime of beauty.",
  },
  {
    icon: Package,
    step: "02",
    title: "Receive Your Box",
    desc: "We ship a premium collection box right to your doorstep, free of charge.",
  },
  {
    icon: Send,
    step: "03",
    title: "Send Your Sample",
    desc: "Fill the box with your hair sample and ship it back. We cover the hassle.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Enjoy Free Services",
    desc: "Get approved and unlock free cosmetic services at top partner salons.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    text: "Focliy changed my beauty routine completely. I got a complimentary hair spa worth ₹2000 — all free!",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    city: "Bangalore",
    text: "The process was so simple and the salons are absolutely premium. Best ₹535 I've ever spent!",
    rating: 5,
  },
  {
    name: "Meera Krishnan",
    city: "Chennai",
    text: "I was skeptical at first but the hair analysis was thorough and the free services were amazing.",
    rating: 5,
  },
];

const STARS = [1, 2, 3, 4, 5];

type ServiceCategory = {
  id: string;
  label: string;
  image: string;
  groups: { title: string; services: string[] }[];
};

const serviceCategories: ServiceCategory[] = [
  {
    id: "facials",
    label: "Facials & Cleanup",
    image: "/assets/generated/service-facial.dim_600x400.jpg",
    groups: [
      {
        title: "Aroma",
        services: [
          "Aroma Pearl Facial",
          "Aroma Fruit Papaya Facial",
          "Aroma Fruit Facial",
          "Aroma Aloevera Facial",
          "Aroma Haldi Chandan Anti Ageing Facial",
          "Aroma Oxygen Herbal Spa Facial",
          "Aroma Wine Facial",
          "Aroma D-Tan Facial",
          "Aroma Gold Facial",
          "Aroma Acne Pimple Facial",
          "Real Aroma 24Ct Gold",
        ],
      },
      {
        title: "VLCC",
        services: [
          "Vlcc Insta Glow",
          "Vlcc Fruit Facial",
          "Vlcc Skin Tightening",
          "Vlcc Anti Tan",
          "Vlcc Skin Tightening 5 Steps",
          "Vlcc Skin Whitening",
          "Vlcc Party Glow",
          "Vlcc Skin Glow 5 Steps",
          "Vlcc Papaya",
          "Vlcc Gold Facial",
          "Vlcc Diamond Facial",
        ],
      },
      {
        title: "Aroma Magic Blossom Kochhar",
        services: [
          "Aroma Magic Skin Glow",
          "Aroma Magic Gold Facial",
          "Aroma Magic Bridal Glow",
          "Aroma Magic Diamond Facial",
        ],
      },
      {
        title: "Lotus",
        services: ["Lotus White Glow", "Lotus Natural Glow", "Lotus Gold"],
      },
      {
        title: "O3+",
        services: ["O3+ Shine Glow", "O3+ Bridal Glow"],
      },
      {
        title: "L'Oréal Cheryl's",
        services: ["L'Oréal Cheryl's Tan Clear"],
      },
      {
        title: "Shahnaz Husain",
        services: [
          "Shahnaz Husain Papaya (Fruit)",
          "Shahnaz Husain Anti-Ageing (Pro)",
          "Shahnaz Husain Skin Whitening (Pro)",
          "Shahnaz Husain Signature (Pro)",
        ],
      },
      {
        title: "Raaga",
        services: [
          "Raaga Express Facial Dry Skin",
          "Raaga Express Facial Oily Skin",
          "Raaga Professional Gold Facial",
          "Raaga Professional Fairness Facial with Strawberry Extract",
          "Raaga Professional Anti Aging Facial",
          "Raaga Professional Fairness Facial",
        ],
      },
    ],
  },
  {
    id: "bleach",
    label: "Bleach",
    image: "/assets/generated/service-waxing.dim_600x400.jpg",
    groups: [
      {
        title: "Face Bleach",
        services: [
          "Add Bleach Neck",
          "Add Bleach Half Back",
          "Adisha Mango Fruit Bleach (face)",
          "Aroma Aina Bleach Mix Fruit (face)",
          "Aroma Aina Bleach Gold (face)",
          "OxyLife Natural Radiance 5 Bleach (Face)",
          "Adisha OXY Bleach (Face)",
          "Aroma Aina Bleach OXY Insta Fairness (face)",
          "VLCC Bleach Diamond (Face)",
          "Olivia HERBAL Bleach (Face)",
        ],
      },
      {
        title: "Body Bleach",
        services: [
          "Aroma Aina Gold Bleach Full Body",
          "Adisha Oxy Bleach Full Body",
          "Aroma Aina Fruit Bleach Full Body",
          "Aroma Adisha Mango Bleach Full Arms",
          "Aroma Adisha Mango Full Legs",
          "Aroma Adisha Mango Bleach Stomach",
          "Aroma Adisha Mango Bleach Back",
          "Aroma Adisha Mango Bleach Half Back",
          "Aroma Adisha Mango Bleach Full Body",
        ],
      },
    ],
  },
  {
    id: "mani-pedi",
    label: "Manicure & Pedicure",
    image: "/assets/generated/service-nails.dim_600x400.jpg",
    groups: [
      {
        title: "Manicure & Pedicure Services",
        services: [
          "Aroma Normal Mani-Pedi (2 Steps Scrub & Cream) + Cut & File",
          "Aroma Normal Mani-Pedi (3 Steps Scrub, Cream & Salt) + Cut & File",
          "VLCC 4 Steps Manicure & Pedicure + Cut File & Polish",
          "Sara Rose 5 Steps Deluxe Manicure & Pedicure + Cut File & Polish",
          "O3+ Bubble Gum 6 Steps Deluxe Manicure & Pedicure + Cut File & Polish",
          "Add Foot & Hands Spa (Aroma Cream + Steam)",
          "Only Cut File Polish - Hands & Feet",
        ],
      },
    ],
  },
  {
    id: "hair",
    label: "Hair Care",
    image: "/assets/generated/service-hair.dim_600x400.jpg",
    groups: [
      {
        title: "Smoothening & Rebounding",
        services: [
          "Schwarzkopf Glatt Smoothening (upto Shoulder length)",
          "Schwarzkopf Glatt Smoothening (Below Shoulder length)",
          "L'Oréal Smoothening (Any length)",
          "Schwarzkopf Glatt Rebounding (Upto Shoulder length)",
          "Schwarzkopf Glatt Rebounding (Below Shoulder length)",
          "L'Oréal Rebounding (Any length)",
        ],
      },
      {
        title: "Keratin Treatment",
        services: [
          "Global Amazon Keratin Treatment",
          "Brazilian Keratin Treatment",
          "Advance Keratin KB Banana Protein with Biotin (Imported from Spain)",
          "Advance Hair Treatment Creighton (Imported from England)",
        ],
      },
      {
        title: "Hair Spa",
        services: [
          "Hair SPA/Mask Steam Keratin (upto shoulder)",
          "Hair SPA/Mask Steam Keratin (below shoulder)",
          "Hair SPA Steam Loreal (upto shoulder)",
          "Hair SPA Steam Loreal (below shoulder)",
          "Hair Masque Steam Matrix (upto shoulder)",
          "Hair Masque Steam Matrix (below shoulder)",
          "Add Blow Dry to your Hair Spa",
        ],
      },
      {
        title: "Hair Color",
        services: [
          "Root Touchup 3 inch: Garnier Color Natural",
          "Global Hair Color: Garnier Color Natural",
          "Root Touchup 3 inch: L'Oréal Majirel",
          "Global Hair Color: L'Oréal Majirel",
          "Root Touchup 3 inch: L'Oréal iNOA (No Ammonia)",
          "Global Hair Color: L'Oréal iNOA (No Ammonia)",
          "Hair Highlight (share image on WhatsApp)",
        ],
      },
    ],
  },
  {
    id: "waxing",
    label: "Waxing",
    image: "/assets/generated/service-waxing.dim_600x400.jpg",
    groups: [
      {
        title: "Aloe Vera Wax",
        services: [
          "Aloevera Underarms",
          "Aloevera Honey Wax Half Arms",
          "Aloevera Honey Wax Full Arms",
          "Aloevera Honey Wax Half Leg",
          "Aloevera Honey Wax Full Leg",
          "Aloevera Honey Wax Stomach",
          "Aloevera Honey Wax Full Back",
          "Aloevera Honey Wax Half Back",
          "Aloevera Honey Wax Full Face",
          "Aloevera Honey Wax Only Upper-Lips",
          "Aloevera Honey Wax Only Side-Locks",
          "Aloevera Honey Wax Only Chin",
          "Aloevera Honey Wax Only Cheeks",
          "Aloevera Honey Wax Full Body",
        ],
      },
      {
        title: "Rica Wax",
        services: [
          "Rica White Chocolate Half Arms",
          "Rica White Chocolate Underarms",
          "Rica White Chocolate Full Arms",
          "Rica White Chocolate Half Legs",
          "Rica White Chocolate Full Legs",
          "Rica White Chocolate Stomach",
          "Rica White Chocolate Full Back",
          "Rica White Chocolate Half Back",
          "Rica White Chocolate Only Chin",
          "Rica White Chocolate Only Cheeks",
          "Rica White Chocolate Only Upper-Lips",
          "Rica White Chocolate Sidelock",
          "Rica White Chocolate Full Face",
          "Rica White Chocolate Full Body",
        ],
      },
      {
        title: "Bikini Wax",
        services: [
          "Honey Full Bikini Wax",
          "Honey Bikini Line / Bikini Sides Area",
          "Honey Butt Wax",
          "Rica Full Bikini Wax",
          "Rica Bikini Line / Bikini Sides Area",
          "Rica Butt Wax",
          "Brazilian Full Bikini Wax",
        ],
      },
    ],
  },
  {
    id: "dtan",
    label: "D-Tan",
    image: "/assets/generated/service-facial.dim_600x400.jpg",
    groups: [
      {
        title: "Aadro DE-Tan",
        services: [
          "Aadro DE-Tan Face",
          "Aadro DE-Tan Full Arms",
          "Aadro DE-Tan Full Legs",
          "Aadro DE-Tan Stomach",
          "Aadro DE-Tan Back",
          "Aadro DE-Tan Full Body",
        ],
      },
      {
        title: "Raaga DE-Tan",
        services: [
          "Raaga DE-Tan Face",
          "Raaga DE-Tan Stomach",
          "Raaga DE-Tan Back",
          "Raaga DE-Tan Full Arms",
          "Raaga DE-Tan Half Legs",
          "Raaga DE-Tan Full Legs",
          "Raaga DE-Tan Full Body",
        ],
      },
    ],
  },
  {
    id: "nails",
    label: "Nail Extensions & Art",
    image: "/assets/generated/service-nails.dim_600x400.jpg",
    groups: [
      {
        title: "Nail Extensions – Hands",
        services: [
          "Acrylic Based Nail Extension – Hands",
          "Gel Based Nail Extension – Hands",
        ],
      },
      {
        title: "Nail Extensions – Foot",
        services: [
          "Acrylic Based Nail Extension – Foot",
          "Gel Based Nail Extension – Foot",
        ],
      },
      {
        title: "Nail Art (per finger)",
        services: [
          "Glitter – Shining",
          "Crystal – Stone",
          "Chrome – Barik Gliter",
          "Spider – Lining",
          "French – 2 Color",
        ],
      },
      {
        title: "Nail Extension Removal",
        services: [
          "Old Nail Extension Removal (Hands)",
          "Old Nail Extension Removal (Foot)",
        ],
      },
    ],
  },
  {
    id: "body",
    label: "Body Polishing",
    image: "/assets/generated/service-waxing.dim_600x400.jpg",
    groups: [
      {
        title: "Body Treatment",
        services: ["Body Polishing"],
      },
    ],
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[560px] flex items-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/assets/generated/hero-beauty.dim_1200x500.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_20/0.85)] via-[oklch(0.15_0.05_15/0.7)] to-[oklch(0.18_0.03_30/0.4)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.1_0.03_20/0.6)] via-transparent to-transparent" />

        <div className="container relative py-24 md:py-36 flex flex-col items-start text-left gap-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-white/15 text-white border-white/30 backdrop-blur-sm px-4 py-1 text-xs font-medium tracking-widest uppercase">
              ✨ India's Premier Hair & Beauty Membership
            </Badge>
          </motion.div>

          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold leading-tight text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Your Hair.{" "}
            <span className="text-gradient-gold italic">Your Choice.</span>
            <br />
            Free Salon Services.
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join Focliy and unlock complimentary cosmetic services at partner
            salons across India — all for just{" "}
            <strong className="text-white">₹535/year</strong>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={handleCTA}
              data-ocid="hero.primary_button"
              className="px-8 py-6 text-base font-semibold shadow-rose hover:shadow-lg transition-all bg-primary text-primary-foreground"
            >
              Become a Member — ₹535/yr
            </Button>
            <Button
              size="lg"
              variant="outline"
              data-ocid="hero.secondary_button"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-6 text-base border-white/40 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              How It Works
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 pt-4 text-sm text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-300" /> 2000+ Happy Members
            </span>
            <span className="flex items-center gap-1">
              <Scissors className="w-4 h-4 text-rose-300" /> 50+ Partner Salons
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-300" /> 4.9 Rating
            </span>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
              Simple Process
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              How Focliy Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="gradient-card border-border hover:shadow-rose transition-all duration-300 h-full">
                  <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <s.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-4xl font-display font-bold text-border">
                        {s.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
              What We Offer
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Explore our wide range of premium beauty services available to
              Focliy members at partner salons across India.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs defaultValue="facials" data-ocid="services.tab">
              <div className="overflow-x-auto pb-2 mb-8">
                <TabsList className="inline-flex h-auto gap-2 bg-background border border-border p-1.5 rounded-2xl w-max">
                  {serviceCategories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {serviceCategories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2">
                      <div className="sticky top-24 rounded-2xl overflow-hidden shadow-gold">
                        <img
                          src={cat.image}
                          alt={cat.label}
                          className="w-full h-64 lg:h-80 object-cover"
                        />
                        <div className="bg-gradient-to-t from-[oklch(0.15_0.04_20/0.8)] to-transparent absolute inset-0 pointer-events-none" />
                        <div className="p-5 bg-card border-t border-border">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <h3 className="font-display text-lg font-semibold text-foreground">
                              {cat.label}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cat.groups.reduce(
                              (acc, g) => acc + g.services.length,
                              0,
                            )}{" "}
                            services available
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                      {cat.groups.map((group) => (
                        <div key={group.title}>
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-display text-base font-semibold text-foreground">
                              {group.title}
                            </h4>
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">
                              {group.services.length} services
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group.services.map((service) => (
                              <span key={service} className="service-pill">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
              Real Stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Members Love Focliy
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="gradient-card h-full hover:shadow-rose transition-all">
                  <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {STARS.map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1">
                      "{t.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Ready to Glow?
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 text-lg">
              Join thousands of women who have transformed their beauty routine
              with Focliy.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleCTA}
              data-ocid="cta.primary_button"
              className="px-10 py-6 text-base font-semibold"
            >
              Get Started — ₹535/yr
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
