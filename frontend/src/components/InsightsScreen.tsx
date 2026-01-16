import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin, Recycle, Trash2, Leaf, CheckCircle2, Loader2 } from "lucide-react";

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  lat: number;
  lng: number;
  reward: {
    recycling: number;
    trash: number;
    compost: number;
  };
}

const EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Golden Gate Park Cleanup",
    date: "Sat, June 15 • 9:00 AM",
    location: "Golden Gate Park, SF",
    description: "Join us for a community cleanup at Golden Gate Park. Gloves and bags provided!",
    lat: 37.7694,
    lng: -122.4862,
    reward: {
      recycling: 500,
      trash: 200,
      compost: 100,
    },
  },
  {
    id: "evt-2",
    title: "Ocean Beach Cleanup",
    date: "Sun, June 16 • 10:00 AM",
    location: "Ocean Beach, SF",
    description: "Help keep our beaches clean! Sort plastics and recyclables with the team.",
    lat: 37.7594,
    lng: -122.5107,
    reward: {
      recycling: 800,
      trash: 100,
      compost: 0,
    },
  },
  {
    id: "evt-3",
    title: "Mission District Compost Workshop",
    date: "Wed, June 19 • 6:00 PM",
    location: "Mission District, SF",
    description: "Learn how to compost at home and help maintain the community compost pile.",
    lat: 37.7599,
    lng: -122.4148,
    reward: {
      recycling: 0,
      trash: 0,
      compost: 1000,
    },
  },
];

export function InsightsScreen() {
  const { user, refreshUser } = useUser();
  const [claimedEvents, setClaimedEvents] = useState<string[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Load claimed events from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("claimedEvents");
    if (stored) {
      setClaimedEvents(JSON.parse(stored));
    }
  }, []);

  const handleClaim = async (event: Event) => {
    // Just toggle state locally without calling backend
    if (!user) return;
    setClaiming(event.id);
    
    // Simulate network delay
    setTimeout(() => {
      // Update local claimed state
      const newClaimed = [...claimedEvents, event.id];
      setClaimedEvents(newClaimed);
      localStorage.setItem("claimedEvents", JSON.stringify(newClaimed));
      setClaiming(null);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Map Section - Top Half */}
      <div className="h-[40vh] w-full relative z-0">
        <MapContainer 
          center={[37.7749, -122.4194]} 
          zoom={12} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {EVENTS.map((event) => (
            <Marker key={event.id} position={[event.lat, event.lng]}>
              <Popup>
                <div className="text-sm font-bold">{event.title}</div>
                <div className="text-xs text-muted-foreground">{event.location}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Overlay Header */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Local Events
            </h1>
            <p className="text-xs text-muted-foreground">
              Participate to earn massive rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Events List - Bottom Half */}
      <div className="flex-1 bg-background -mt-4 rounded-t-3xl relative z-10 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
        
        <div className="space-y-4">
          {EVENTS.map((event) => {
            const isClaimed = claimedEvents.includes(event.id);
            
            return (
              <Card key={event.id} className={`overflow-hidden transition-all ${isClaimed ? 'opacity-75 bg-muted/30' : 'hover:shadow-md'}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg leading-none mb-1">{event.title}</h3>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Badge variant={isClaimed ? "secondary" : "default"} className={`${isClaimed ? "bg-green-100 text-green-800" : "bg-green-600 hover:bg-green-700"}`}>
                      {isClaimed ? "Completed" : "Active"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-muted/50 p-2 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      {event.reward.recycling > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <Recycle className="h-3 w-3" />
                          +{event.reward.recycling}
                        </div>
                      )}
                      {event.reward.compost > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Leaf className="h-3 w-3" />
                          +{event.reward.compost}
                        </div>
                      )}
                      {event.reward.trash > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <Trash2 className="h-3 w-3" />
                          +{event.reward.trash}
                        </div>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => handleClaim(event)}
                      disabled={isClaimed || claiming === event.id}
                      className={isClaimed ? "pl-2" : ""}
                    >
                      {claiming === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isClaimed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          RSVP'd
                        </>
                      ) : (
                        "RSVP"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
