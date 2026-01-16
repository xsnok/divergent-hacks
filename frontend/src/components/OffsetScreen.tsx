import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Recycle,
  Trash2,
  Leaf,
  CheckCircle2,
  Loader2,
  Zap,
  Ticket,
  Store,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function OffsetScreen() {
  const { user, refreshUser, reward } = useUser();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"offsets" | "coupons">("offsets");

  // Check if reward is expired
  const activeReward = reward && reward.expiresAt > Date.now() ? reward : null;

  const projects = [
    {
      id: "brazil-reforestation",
      title: "Plant Reforestation in the Brazilian Forest",
      location: "Brazil",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
      offset: 1.0,
      cost: {
        recycling: 5,
        trash: 0,
        compost: 0,
      },
      badge: "Germany Awards",
    },
    {
      id: "morocco-solar",
      title: "Solar Energy Farm in Morocco",
      location: "Morocco",
      image:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
      offset: 0.8,
      cost: {
        recycling: 0,
        trash: 2,
        compost: 0,
      },
    },
    {
      id: "denmark-wind",
      title: "Wind Power Initiative",
      location: "Denmark",
      image:
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&q=80",
      offset: 1.2,
      cost: {
        recycling: 4,
        trash: 2,
        compost: 0,
      },
    },
  ];

  const coupons = [
    {
      id: "starbucks-5",
      title: "$5 Gift Card",
      business: "Starbucks",
      image:
        "https://images.unsplash.com/photo-1544233726-9f1d2b27bd8b?w=600&q=80",
      cost: {
        recycling: 5,
        trash: 0,
        compost: 0,
      },
      category: "Food & Drink",
    },
    {
      id: "patagonia-20",
      title: "20% Off Voucher",
      business: "Patagonia",
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
      cost: {
        recycling: 10,
        trash: 0,
        compost: 0,
      },
      category: "Outdoor & Apparel",
    },
    {
      id: "wholefoods-10",
      title: "$10 Grocery Credit",
      business: "Whole Foods",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
      cost: {
        recycling: 8,
        trash: 0,
        compost: 2,
      },
      category: "Groceries",
    },
    {
      id: "ikea-15",
      title: "$15 Store Credit",
      business: "IKEA",
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
      cost: {
        recycling: 6,
        trash: 2,
        compost: 0,
      },
      category: "Home Goods",
    },
  ];

  const handlePurchase = async (project: (typeof projects)[0]) => {
    if (!user) return;

    const discount = activeReward?.discount || 0;
    const multiplier = activeReward?.multiplier || 1;

    const finalCost = {
      recycling: Math.floor(project.cost.recycling * (1 - discount)),
      trash: Math.floor(project.cost.trash * (1 - discount)),
      compost: Math.floor(project.cost.compost * (1 - discount)),
    };

    const finalOffset = project.offset * multiplier;

    if (
      user.recycling_currency < finalCost.recycling ||
      user.trash_currency < finalCost.trash ||
      user.compost_currency < finalCost.compost
    ) {
      alert("Insufficient funds!");
      return;
    }

    setPurchasing(project.id);
    try {
      // 1. Record the purchase
      const { error: purchaseError } = await supabase
        .from("purchased_offsets")
        .insert({
          user_id: user.id,
          project_title: project.title,
          amount_tons: finalOffset,
          cost_recycling: finalCost.recycling,
          cost_trash: finalCost.trash,
          cost_compost: finalCost.compost,
        });

      if (purchaseError) throw purchaseError;

      // 2. Update user currency
      const { error: userError } = await supabase.rpc("update_user_currency", {
        p_user_id: user.id,
        p_recycling: -finalCost.recycling,
        p_trash: -finalCost.trash,
        p_compost: -finalCost.compost,
        p_items_count: 0, // No new items logged
      });

      if (userError) throw userError;

      await refreshUser();
      setSuccess(project.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error purchasing offset:", error);
      alert("Failed to process purchase. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseCoupon = async (coupon: (typeof coupons)[0]) => {
    if (!user) return;

    const discount = activeReward?.discount || 0;

    const finalCost = {
      recycling: Math.floor(coupon.cost.recycling * (1 - discount)),
      trash: Math.floor(coupon.cost.trash * (1 - discount)),
      compost: Math.floor(coupon.cost.compost * (1 - discount)),
    };

    if (
      user.recycling_currency < finalCost.recycling ||
      user.trash_currency < finalCost.trash ||
      user.compost_currency < finalCost.compost
    ) {
      alert("Insufficient funds!");
      return;
    }

    setPurchasing(coupon.id);
    try {
      // 1. Record the coupon purchase
      const { error: purchaseError } = await supabase
        .from("purchased_coupons")
        .insert({
          user_id: user.id,
          business_name: coupon.business,
          coupon_title: coupon.title,
          cost_recycling: finalCost.recycling,
          cost_trash: finalCost.trash,
          cost_compost: finalCost.compost,
          coupon_code: Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase(),
        });

      if (purchaseError) throw purchaseError;

      // 2. Update user currency
      const { error: userError } = await supabase.rpc("update_user_currency", {
        p_user_id: user.id,
        p_recycling: -finalCost.recycling,
        p_trash: -finalCost.trash,
        p_compost: -finalCost.compost,
        p_items_count: 0,
      });

      if (userError) throw userError;

      await refreshUser();
      setSuccess(coupon.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error purchasing coupon:", error);
      alert("Failed to process purchase. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-b from-green-900/40 to-transparent">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80')] bg-cover bg-center opacity-40" />
        <div className="relative p-4 pt-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-80">Your Balance</p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Recycle className="h-4 w-4 text-blue-400" />
                  <span className="font-bold">
                    {user?.recycling_currency || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Leaf className="h-4 w-4 text-green-400" />
                  <span className="font-bold">
                    {user?.compost_currency || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Trash2 className="h-4 w-4 text-red-400" />
                  <span className="font-bold">{user?.trash_currency || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-4">
        {/* Active Reward Alert */}
        {activeReward && (
          <div className="bg-yellow-500 text-black p-3 rounded-xl flex items-center justify-between shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 fill-current" />
              <div>
                <p className="font-bold text-sm">Boost Active!</p>
                <p className="text-[10px] opacity-80 uppercase font-bold">
                  {activeReward.discount * 100}% Off • {activeReward.multiplier}
                  x Impact
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold">
              {Math.ceil((activeReward.expiresAt - Date.now()) / 60000)}m left
            </div>
          </div>
        )}

        {/* Offset Section Header */}
        <div className="bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-sm">
          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-4">
            <button
              onClick={() => setActiveTab("offsets")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "offsets"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Leaf className="h-4 w-4" />
              Offsets
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "coupons"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ticket className="h-4 w-4" />
              Coupons
            </button>
          </div>

          <h2 className="text-xl font-bold mb-1">
            {activeTab === "offsets" ? "Offset Your Carbon" : "Local Rewards"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeTab === "offsets"
              ? "Support verified projects to balance your footprint"
              : "Redeem points for discounts at eco-friendly businesses"}
          </p>
        </div>

        {/* Content Grid */}
        <div className="space-y-4">
          {activeTab === "offsets"
            ? projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="relative">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                    {project.badge && (
                      <Badge className="absolute top-3 left-3 bg-green-600">
                        {project.badge}
                      </Badge>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-semibold">
                      {activeReward
                        ? (project.offset * activeReward.multiplier).toFixed(1)
                        : project.offset}{" "}
                      ton CO₂
                      {activeReward && activeReward.multiplier > 1 && (
                        <span className="ml-1 text-yellow-400 text-[10px] font-black italic">
                          BOOSTED
                        </span>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {project.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Cost{" "}
                          {activeReward && activeReward.discount > 0 && (
                            <span className="text-green-600">
                              (-{activeReward.discount * 100}%)
                            </span>
                          )}
                        </p>
                        <div className="flex gap-3">
                          {project.cost.recycling > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                              <Recycle className="h-3.5 w-3.5" />
                              <span
                                className={
                                  activeReward && activeReward.discount > 0
                                    ? "line-through opacity-50 text-[10px]"
                                    : ""
                                }
                              >
                                {project.cost.recycling}
                              </span>
                              {activeReward && activeReward.discount > 0 && (
                                <span>
                                  {Math.floor(
                                    project.cost.recycling *
                                      (1 - activeReward.discount)
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                          {project.cost.compost > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                              <Leaf className="h-3.5 w-3.5" />
                              <span
                                className={
                                  activeReward && activeReward.discount > 0
                                    ? "line-through opacity-50 text-[10px]"
                                    : ""
                                }
                              >
                                {project.cost.compost}
                              </span>
                              {activeReward && activeReward.discount > 0 && (
                                <span>
                                  {Math.floor(
                                    project.cost.compost *
                                      (1 - activeReward.discount)
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                          {project.cost.trash > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span
                                className={
                                  activeReward && activeReward.discount > 0
                                    ? "line-through opacity-50 text-[10px]"
                                    : ""
                                }
                              >
                                {project.cost.trash}
                              </span>
                              {activeReward && activeReward.discount > 0 && (
                                <span>
                                  {Math.floor(
                                    project.cost.trash *
                                      (1 - activeReward.discount)
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePurchase(project)}
                        disabled={
                          purchasing !== null ||
                          !user ||
                          user.recycling_currency <
                            (activeReward
                              ? Math.floor(
                                  project.cost.recycling *
                                    (1 - activeReward.discount)
                                )
                              : project.cost.recycling) ||
                          user.trash_currency <
                            (activeReward
                              ? Math.floor(
                                  project.cost.trash *
                                    (1 - activeReward.discount)
                                )
                              : project.cost.trash) ||
                          user.compost_currency <
                            (activeReward
                              ? Math.floor(
                                  project.cost.compost *
                                    (1 - activeReward.discount)
                                )
                              : project.cost.compost)
                        }
                        size="sm"
                        className={
                          success === project.id
                            ? "bg-green-600 hover:bg-green-600"
                            : ""
                        }
                      >
                        {purchasing === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : success === project.id ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          "Purchase Offset"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            : coupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden">
                  <div className="relative">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${coupon.image})` }}
                    />
                    <Badge className="absolute top-3 left-3 bg-blue-600">
                      {coupon.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Store className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {coupon.business}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight">
                          {coupon.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Price{" "}
                          {activeReward && activeReward.discount > 0 && (
                            <span className="text-green-600">
                              (-{activeReward.discount * 100}%)
                            </span>
                          )}
                        </p>
                        <div className="flex gap-3">
                          {coupon.cost.recycling > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                              <Recycle className="h-3.5 w-3.5" />
                              <span
                                className={
                                  activeReward && activeReward.discount > 0
                                    ? "line-through opacity-50 text-[10px]"
                                    : ""
                                }
                              >
                                {coupon.cost.recycling}
                              </span>
                              {activeReward && activeReward.discount > 0 && (
                                <span>
                                  {Math.floor(
                                    coupon.cost.recycling *
                                      (1 - activeReward.discount)
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                          {coupon.cost.compost > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                              <Leaf className="h-3.5 w-3.5" />
                              <span
                                className={
                                  activeReward && activeReward.discount > 0
                                    ? "line-through opacity-50 text-[10px]"
                                    : ""
                                }
                              >
                                {coupon.cost.compost}
                              </span>
                              {activeReward && activeReward.discount > 0 && (
                                <span>
                                  {Math.floor(
                                    coupon.cost.compost *
                                      (1 - activeReward.discount)
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                          {coupon.cost.trash > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span
                                className={
                                  activeReward && activeReward.discount > 0
                                    ? "line-through opacity-50 text-[10px]"
                                    : ""
                                }
                              >
                                {coupon.cost.trash}
                              </span>
                              {activeReward && activeReward.discount > 0 && (
                                <span>
                                  {Math.floor(
                                    coupon.cost.trash *
                                      (1 - activeReward.discount)
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handlePurchaseCoupon(coupon)}
                        disabled={
                          purchasing !== null ||
                          !user ||
                          user.recycling_currency <
                            (activeReward
                              ? Math.floor(
                                  coupon.cost.recycling *
                                    (1 - activeReward.discount)
                                )
                              : coupon.cost.recycling) ||
                          user.trash_currency <
                            (activeReward
                              ? Math.floor(
                                  coupon.cost.trash *
                                    (1 - activeReward.discount)
                                )
                              : coupon.cost.trash) ||
                          user.compost_currency <
                            (activeReward
                              ? Math.floor(
                                  coupon.cost.compost *
                                    (1 - activeReward.discount)
                                )
                              : coupon.cost.compost)
                        }
                        size="sm"
                        className={
                          success === coupon.id
                            ? "bg-green-600 hover:bg-green-600"
                            : ""
                        }
                      >
                        {purchasing === coupon.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : success === coupon.id ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          "Redeem Coupon"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </div>
  );
}
