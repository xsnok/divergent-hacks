import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatTonnes } from "@/lib/carbon";

export function HomeScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOffset: 0,
    monthlyData: [] as { label: string; value: number }[],
    recentOffsets: [] as any[],
  });

  useEffect(() => {
    async function fetchHomeData() {
      if (!user) return;

      try {
        // 1. Fetch total offsets from purchased_offsets
        const { data: offsetData } = await supabase
          .from("purchased_offsets")
          .select("amount_tons")
          .eq("user_id", user.id);

        const totalOffset =
          offsetData?.reduce((acc, curr) => acc + Number(curr.amount_tons), 0) ||
          0;

        // 2. Fetch monthly logging data for chart
        const { data: loggingData } = await supabase
          .from("logged_items")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        // Group by month
        const monthlyMap = new Map<string, number>();
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d.toLocaleString("default", { month: "short" });
        }).reverse();

        last6Months.forEach((m) => monthlyMap.set(m, 0));

        loggingData?.forEach((item) => {
          const month = new Date(item.created_at).toLocaleString("default", {
            month: "short",
          });
          if (monthlyMap.has(month)) {
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
          }
        });

        const chartData = Array.from(monthlyMap.entries()).map(
          ([label, value]) => ({
            label,
            value,
          })
        );

        // 3. Fetch recent offset projects (could also just be hardcoded recommended ones)
        setStats({
          totalOffset,
          monthlyData: chartData,
          recentOffsets: offsetData?.slice(0, 2) || [],
        });
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, [user]);

  const maxValue = Math.max(...stats.monthlyData.map((d) => d.value), 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900/20 to-background pb-20">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-b from-green-900/40 to-transparent">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80')] bg-cover bg-center opacity-40" />
        <div className="relative flex items-center justify-between p-4">
          <Badge variant="secondary" className="bg-white/90">
            Offset {stats.totalOffset.toFixed(2)} tonnes
          </Badge>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Carbon Circle Display */}
        <div className="relative flex justify-center pt-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-900/60 backdrop-blur-sm border-4 border-white/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.totalOffset.toFixed(2)}
              </div>
              <div className="text-xs text-white/80">tonnes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-4">
        {/* Greeting Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Hi, {user?.username?.split("_")[0] || "Eco Warrior"}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  You've logged {user?.total_items_logged || 0} items so far
                </p>
              </div>
              <Badge className="bg-green-600">Level {Math.floor((user?.total_items_logged || 0) / 10) + 1}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Items Logged</h3>
              <div className="text-xs text-muted-foreground">Last 6 months</div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.monthlyData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 gap-2"
                >
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className="w-full bg-green-500/40 rounded-t transition-all hover:bg-green-500"
                      style={{ height: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Offset Emissions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recommended Projects</h3>
            <Button variant="link" className="text-sm text-green-600">
              See more
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="overflow-hidden">
              <div className="h-24 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80')] bg-cover bg-center" />
              <CardContent className="p-3">
                <h4 className="font-semibold text-xs leading-tight">
                  Brazilian Rainforest Reforestation
                </h4>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-24 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80')] bg-cover bg-center" />
              <CardContent className="p-3">
                <h4 className="font-semibold text-xs leading-tight">
                  Morocco Solar Farm Energy
                </h4>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
