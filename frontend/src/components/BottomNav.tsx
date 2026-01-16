import { Button } from "@/components/ui/button";
import { Home, Map as MapIcon, Leaf, User, Camera } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const leftNavItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "insights", icon: MapIcon, label: "Events" },
  ];

  const rightNavItems = [
    { id: "offset", icon: Leaf, label: "Offset" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Nav Items */}
          <div className="flex items-center gap-2">
            {leftNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isActive ? "bg-green-600/10" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Center Camera Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTabChange("camera")}
            className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white -mt-8"
          >
            <Camera className="h-6 w-6" />
          </Button>

          {/* Right Nav Items */}
          <div className="flex items-center gap-2">
            {rightNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isActive ? "bg-green-600/10" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
