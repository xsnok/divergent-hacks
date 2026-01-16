import { useState } from "react";
import "./App.css";
import { HomeScreen } from "./components/HomeScreen";
import { InsightsScreen } from "./components/InsightsScreen";
import { OffsetScreen } from "./components/OffsetScreen";
import { BottomNav } from "./components/BottomNav";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "insights":
        return <InsightsScreen />;
      case "offset":
        return <OffsetScreen />;
      case "camera":
        return (
          <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
            <p className="text-muted-foreground">Camera screen coming soon...</p>
          </div>
        );
      case "profile":
        return (
          <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
            <p className="text-muted-foreground">Profile screen coming soon...</p>
          </div>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto relative bg-background min-h-screen">
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
