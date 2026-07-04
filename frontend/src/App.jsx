import React from "react";
import { ProjectProvider } from "./context/ProjectContext";
import Workspace from "./components/Workspace";
import Chat from "./components/Chat";

function App() {
  return (
    <ProjectProvider>
      <div className="app-container">
        {/* Left Panel: Persistent Workspace Directory */}
        <Workspace />

        {/* Right Panel: AI Conversational Workspace */}
        <Chat />
      </div>
    </ProjectProvider>
  );
}

export default App;
