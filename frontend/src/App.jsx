import React from "react";
import { ProjectProvider } from "./context/ProjectContext";
import Workspace from "./components/Workspace";
import Chat from "./components/Chat";

function App() {
  return (
    <ProjectProvider>
      <div className="app-container">
        {/* Left Side: Persistent Project Dashboard */}
        <Workspace />

        {/* Right Side: Gemini AI Interactive Conversation */}
        <Chat />
      </div>
    </ProjectProvider>
  );
}

export default App;
