import { useState } from "react";
import "./App.css";
import { HomeScreen } from "./components/HomeScreen";
import { InsightsScreen } from "./components/InsightsScreen";
import { OffsetScreen } from "./components/OffsetScreen";
import { CameraScreen } from "./components/CameraScreen";
import { ProfileScreen } from "./components/ProfileScreen";
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
        return <CameraScreen />;
      case "profile":
        return <ProfileScreen />;
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
