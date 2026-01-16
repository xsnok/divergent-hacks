import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Lightbulb, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateCarbonSaved } from "@/lib/carbon";

interface BreakdownItem {
  category: string;
  kg: string;
  count: number;
  color: string;
  percentage: number;
}

interface SegmentItem extends BreakdownItem {
  startPercentage: number;
  endPercentage: number;
}

export function InsightsScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    breakdown: [] as BreakdownItem[],
    totalKg: 0,
    topCategory: "",
  });

  useEffect(() => {
    async function fetchInsights() {
      if (!user) return;

      try {
        const { data: items } = await supabase
          .from("logged_items")
          .select("category")
          .eq("user_id", user.id);

        if (!items) return;

        const counts: Record<string, number> = {};
        items.forEach((item: { category: string }) => {
          counts[item.category] = (counts[item.category] || 0) + 1;
        });

        let totalKg = 0;
        const colors = [
          "#10b981",
          "#34d399",
          "#6ee7b7",
          "#86efac",
          "#a7f3d0",
          "#064e3b",
        ];
        
        const breakdown = Object.entries(counts).map(([cat, count], index) => {
          const kg = calculateCarbonSaved(cat, count);
          totalKg += kg;
          return {
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
            kg: kg.toFixed(1),
            count,
            color: colors[index % colors.length],
            percentage: 0, // Placeholder to be filled next
          };
        });

        // Add percentages
        const finalBreakdown = breakdown.map((item) => ({
          ...item,
          percentage: totalKg > 0 ? Math.round((Number(item.kg) / totalKg) * 100) : 0,
        })).sort((a, b) => b.percentage - a.percentage);

        setData({
          breakdown: finalBreakdown,
          totalKg: Number(totalKg.toFixed(1)),
          topCategory: finalBreakdown[0]?.category || "None",
        });
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [user]);

  // Calculate donut chart segments
  let cumulativePercentage = 0;
  const segments: SegmentItem[] = data.breakdown.map((item) => {
    const startPercentage = cumulativePercentage;
    cumulativePercentage += item.percentage;
    return {
      ...item,
      startPercentage,
      endPercentage: cumulativePercentage,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Carbon Savings</h1>
          <Badge variant="outline" className="gap-1 bg-white/50 backdrop-blur-sm">
            <span className="text-[10px] font-bold">TOTAL IMPACT</span>
          </Badge>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Carbon Footprint Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avoided Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Donut Chart */}
            <div className="flex justify-center mb-8 mt-4">
              <div className="relative h-48 w-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {data.breakdown.length === 0 ? (
                    <circle cx="50" cy="50" r="40" fill="#f3f4f6" />
                  ) : (
                    segments.map((segment, index) => {
                      const startAngle = (segment.startPercentage / 100) * 360;
                      const endAngle = (segment.endPercentage / 100) * 360;
                      const largeArcFlag = segment.percentage > 50 ? 1 : 0;

                      const startX =
                        50 + 40 * Math.cos((Math.PI * startAngle) / 180);
                      const startY =
                        50 + 40 * Math.sin((Math.PI * startAngle) / 180);
                      const endX =
                        50 + 40 * Math.cos((Math.PI * endAngle) / 180);
                      const endY =
                        50 + 40 * Math.sin((Math.PI * endAngle) / 180);

                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={segment.color}
                          stroke="white"
                          strokeWidth="1"
                        />
                      );
                    })
                  )}
                  <circle cx="50" cy="50" r="28" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{data.totalKg}kg</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      CO₂ Saved
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {data.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{item.kg} kg</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Message */}
            <div className="mt-6 flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <Info className="h-4 w-4 mt-0.5 text-green-600" />
              <p className="text-xs text-green-800 leading-relaxed">
                {data.totalKg > 0 
                  ? `${data.topCategory} recycling is your biggest impact area. Keep it up!`
                  : "Start logging your recycling items to see your carbon impact breakdown!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tip of the Day */}
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-white fill-white" />
            <h3 className="font-bold text-white">Eco Tip</h3>
          </div>
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Recycling just one aluminum can saves enough energy to power a TV for three hours.
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-orange-500">95%</span>
                <span className="text-xs font-bold text-gray-500 uppercase">Less Energy</span>
              </div>
            </div>
            <div className="h-32 bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80')] bg-cover bg-center" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
