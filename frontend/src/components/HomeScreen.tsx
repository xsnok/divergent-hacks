import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

export function HomeScreen() {
  const carbonData = [
    { label: "300", value: 60 },
    { label: "Jul", value: 80 },
    { label: "Aug", value: 70 },
    { label: "Sep", value: 85 },
    { label: "Oct", value: 75 },
    { label: "Nov", value: 50 },
  ];

  const maxValue = Math.max(...carbonData.map((d) => d.value));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900/20 to-background pb-20">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-b from-green-900/40 to-transparent">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80')] bg-cover bg-center opacity-40" />
        <div className="relative flex items-center justify-between p-4">
          <Badge variant="secondary" className="bg-white/90">
            Offset 2 hectares
          </Badge>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Carbon Circle Display */}
        <div className="relative flex justify-center pt-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-900/60 backdrop-blur-sm border-4 border-white/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">15.02</div>
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
                <h2 className="text-xl font-bold">Hi, Maria!</h2>
                <p className="text-sm text-muted-foreground">
                  6-22% below your avg carbon footprint
                </p>
              </div>
              <Badge className="bg-green-600">Goal 12 CO₂</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Carbon Footprint Chart */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Carbon Footprint (kg)</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <div className="h-4 w-4 rounded-full bg-green-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                </Button>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between h-32 gap-2">
              {carbonData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className="w-full bg-green-200 rounded-t"
                      style={{ height: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Y-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </CardContent>
        </Card>

        {/* Offset Emissions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Offset Emissions</h3>
            <Button variant="link" className="text-sm">
              See more
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="overflow-hidden">
              <div className="h-24 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80')] bg-cover bg-center" />
              <CardContent className="p-3">
                <h4 className="font-semibold text-sm">
                  Plant Reforestation in the Brazilian Forest
                </h4>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-24 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80')] bg-cover bg-center" />
              <CardContent className="p-3">
                <h4 className="font-semibold text-sm">
                  Agriculture in Southern Spain
                </h4>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
