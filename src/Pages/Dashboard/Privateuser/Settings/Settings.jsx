import React, { useState } from "react";
import SettingsHeader from "./Components/SettingsHeader";
import TestsManager from "./Components/TestsManager";
import UsersManager from "./Components/UsersManager";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("tests"); // Default to Tests as requested

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 fade-in font-outfit">
   
      <SettingsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      

      {activeTab === 'tests' && <TestsManager />}

     
      {activeTab === 'users' && <UsersManager />}

    </div>
  );
};

export default Settings;

