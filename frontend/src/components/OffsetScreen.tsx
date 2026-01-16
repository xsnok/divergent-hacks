import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ArrowUpRight } from "lucide-react";

export function OffsetScreen() {
  const projects = [
    {
      title: "Plant Reforestation in the Brazilian Forest",
      location: "Brazil",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
      offset: "1 ton",
      price: "$12",
      badge: "Germany Awards",
    },
    {
      title: "Solar Energy Farm in Morocco",
      location: "Morocco",
      image:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
      offset: "0.8 ton",
      price: "$10",
    },
    {
      title: "Wind Power Initiative",
      location: "Denmark",
      image:
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&q=80",
      offset: "1.2 ton",
      price: "$15",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-b from-green-900/40 to-transparent">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80')] bg-cover bg-center opacity-40" />
        <div className="relative p-4 pt-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-80">Your Goal</p>
              <h1 className="text-2xl font-bold">
                1:3 CO<sub>2</sub>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Offset Section Header */}
        <div>
          <h2 className="text-xl font-bold mb-1">Offset Your Carbon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Support verified projects to balance your footprint
          </p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden">
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
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {project.location}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                      <span className="font-medium">Offset {project.offset}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-semibold">{project.price}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowUpRight className="h-4 w-4" />
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
