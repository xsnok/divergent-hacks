import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "../contexts/UserContext";
import { Recycle, Trash2, Leaf, Trophy } from "lucide-react";

export function ProfileScreen() {
  const { user, loading } = useUser();

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
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{user.total_items_logged}</p>
                <p className="text-sm text-muted-foreground">Items Logged</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {user.recycling_currency + user.trash_currency + user.compost_currency}
                </p>
                <p className="text-sm text-muted-foreground">Total Currency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Currency Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Recycle className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Recycling</p>
                  <p className="text-xs text-muted-foreground">From recyclables</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg">
                {user.recycling_currency}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Trash2 className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold">Trash</p>
                  <p className="text-xs text-muted-foreground">From landfill items</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg">
                {user.trash_currency}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">Compost</p>
                  <p className="text-xs text-muted-foreground">From organic items</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg">
                {user.compost_currency}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
