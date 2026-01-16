import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Lightbulb } from "lucide-react";

export function InsightsScreen() {
  const carbonBreakdown = [
    { category: "Transport", kg: 219, percentage: 30, color: "#10b981" },
    { category: "Food", kg: 183, percentage: 25, color: "#86efac" },
    { category: "Energy", kg: 146, percentage: 20, color: "#34d399" },
    { category: "Shopping", kg: 73, percentage: 10, color: "#6ee7b7" },
    { category: "Other", kg: 109, percentage: 15, color: "#a7f3d0" },
  ];

  // Calculate donut chart segments
  let cumulativePercentage = 0;
  const segments = carbonBreakdown.map((item) => {
    const startPercentage = cumulativePercentage;
    cumulativePercentage += item.percentage;
    return {
      ...item,
      startPercentage,
      endPercentage: cumulativePercentage,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Your Carbon Insights</h1>
          <Badge variant="outline" className="gap-1">
            <span className="text-xs">D</span>
            <span className="text-xs">W</span>
            <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-xs text-white">M</span>
            </div>
          </Badge>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Carbon Footprint Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Carbon Footprint</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Donut Chart */}
            <div className="flex justify-center mb-6">
              <div className="relative h-48 w-48">
                <svg
                  viewBox="0 0 100 100"
                  className="transform -rotate-90"
                >
                  {segments.map((segment, index) => {
                    const startAngle = (segment.startPercentage / 100) * 360;
                    const endAngle = (segment.endPercentage / 100) * 360;
                    const largeArcFlag = segment.percentage > 50 ? 1 : 0;

                    const startX = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
                    const startY = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
                    const endX = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
                    const endY = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);

                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                  <circle cx="50" cy="50" r="25" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">730kg</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {carbonBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{item.kg} kg</span>
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Message */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Transport is your biggest contributor
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tip of the Day */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Tip of the Day</h3>
            </div>
            <div className="px-4 pb-3">
              <p className="text-sm text-muted-foreground mb-3">
                Use public transport at least once a week could reduce your impact by
              </p>
              <div className="text-3xl font-bold text-green-600 mb-3">12%</div>
            </div>
            <div className="h-32 bg-[url('https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80')] bg-cover bg-center" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
