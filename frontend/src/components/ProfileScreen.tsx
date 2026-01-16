import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "../contexts/UserContext";
import { Recycle, Trash2, Leaf, Trophy, History, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface PurchasedOffset {
  id: string;
  project_title: string;
  amount_tons: number;
  cost_recycling: number;
  cost_trash: number;
  cost_compost: number;
  purchased_at: string;
}

export function ProfileScreen() {
  const { user, loading } = useUser();
  const [offsets, setOffsets] = useState<PurchasedOffset[]>([]);
  const [fetchingOffsets, setFetchingOffsets] = useState(true);

  useEffect(() => {
    async function fetchOffsets() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("purchased_offsets")
          .select("*")
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false });

        if (error) throw error;
        setOffsets(data || []);
      } catch (error) {
        console.error("Error fetching offsets:", error);
      } finally {
        setFetchingOffsets(false);
      }
    }

    if (user) {
      fetchOffsets();
    }
  }, [user]);

  const totalOffset = offsets.reduce(
    (sum, offset) => sum + Number(offset.amount_tons),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">No user found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent p-4 pb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{user.total_items_logged}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Logged
                </p>
              </div>
              <div className="text-center border-x">
                <p className="text-2xl font-bold text-green-600">
                  {totalOffset.toFixed(1)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Tons CO₂
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {user.recycling_currency +
                    user.trash_currency +
                    user.compost_currency}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Total $
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Balances */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Currency Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">Recycling</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm font-bold">
                {user.recycling_currency}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-sm">Trash</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm font-bold">
                {user.trash_currency}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Compost</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm font-bold">
                {user.compost_currency}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Offset History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingOffsets ? (
              <p className="text-sm text-center py-4 text-muted-foreground">
                Loading history...
              </p>
            ) : offsets.length === 0 ? (
              <div className="text-center py-8">
                <Wind className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No offsets purchased yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offsets.map((offset) => (
                  <div
                    key={offset.id}
                    className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm leading-tight">
                        {offset.project_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(offset.purchased_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-sm text-green-600">
                        +{offset.amount_tons}t
                      </p>
                      <div className="flex gap-1 mt-1 justify-end">
                        {offset.cost_recycling > 0 && (
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-blue-500"
                            title="Recycling"
                          />
                        )}
                        {offset.cost_compost > 0 && (
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-green-500"
                            title="Compost"
                          />
                        )}
                        {offset.cost_trash > 0 && (
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-red-500"
                            title="Trash"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
