import React from "react";
import { ProjectProvider } from "./context/ProjectContext";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";
import Chat from "./components/Chat";

function App() {
  return (
    <ProjectProvider>
      <div className="app-container">
        {/* Far Left: Collapsible Conversations Sidebar */}
        <Sidebar />

        {/* Center Panel: Persistent Workspace Directory */}
        <Workspace />

        {/* Right Panel: AI Conversational Workspace */}
        <Chat />
      </div>
    </ProjectProvider>
  );
}

export default App;
