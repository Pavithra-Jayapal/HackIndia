import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [workers, setWorkers] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [todos, setTodos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [emails, setEmails] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Map category keywords to states and setter functions
  const stateMap = {
    workers: { state: workers, setter: setWorkers },
    budgets: { state: budgets, setter: setBudgets },
    inventory: { state: inventory, setter: setInventory },
    todos: { state: todos, setter: setTodos },
    schedules: { state: schedules, setter: setSchedules },
    meetings: { state: meetings, setter: setMeetings },
    emails: { state: emails, setter: setEmails },
    notifications: { state: notifications, setter: setNotifications },
  };

  // 1. Fetch entire workspace and chat history on load
  const fetchWorkspaceData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/workspace`);
      const data = res.data;
      if (data.workers) setWorkers(data.workers);
      if (data.budgets) setBudgets(data.budgets);
      if (data.inventory) setInventory(data.inventory);
      if (data.todos) setTodos(data.todos);
      if (data.schedules) setSchedules(data.schedules);
      if (data.meetings) setMeetings(data.meetings);
      if (data.emails) setEmails(data.emails);
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/history`);
      setChatHistory(res.data);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
    fetchChatHistory();
  }, []);

  // 2. Add / Edit Workspace Item
  const saveWorkspaceItem = async (category, item) => {
    try {
      const endpoint = `${API_BASE}/${category}`;
      let response;
      
      if (item.id) {
        // Edit flow
        response = await axios.put(`${endpoint}/${item.id}`, item);
        const updatedItem = response.data;
        const { setter } = stateMap[category];
        setter(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        
        // Update corresponding widgets in chat history
        setChatHistory(prevChat => prevChat.map(msg => {
          if (msg.widget && msg.widget.dataId === updatedItem.id) {
            return {
              ...msg,
              widget: {
                ...msg.widget,
                submittedData: updatedItem
              }
            };
          }
          return msg;
        }));
        
        return updatedItem;
      } else {
        // Create flow
        response = await axios.post(endpoint, item);
        const createdItem = response.data;
        const { setter } = stateMap[category];
        setter(prev => [...prev, createdItem]);
        return createdItem;
      }
    } catch (err) {
      console.error(`Error saving workspace item in ${category}:`, err);
      throw err;
    }
  };

  // 3. Delete Workspace Item
  const deleteWorkspaceItem = async (category, itemId) => {
    try {
      await axios.delete(`${API_BASE}/${category}/${itemId}`);
      
      // Update local workspace collection state
      const { setter } = stateMap[category];
      setter(prev => prev.filter(item => item.id !== itemId));
      
      // Cascade delete removal of linked messages
      setChatHistory(prevChat => prevChat.filter(msg => !msg.widget || msg.widget.dataId !== itemId));
    } catch (err) {
      console.error(`Error deleting item ${itemId} from ${category}:`, err);
      throw err;
    }
  };

  // 4. Send Message to Chat
  const sendChatMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message to state immediately for immediate UX response
    const tempUserMsg = { id: "temp-user", role: "user", text, widget: null };
    setChatHistory(prev => [...prev, tempUserMsg]);
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { message: text });
      const aiMessage = response.data;
      
      // Append AI message and sync user message
      setChatHistory(prev => {
        const filtered = prev.filter(m => m.id !== "temp-user");
        return [...filtered, { id: "temp-user-sync", role: "user", text }, aiMessage];
      });
      
      // Synchronize dashboard items if workspace state was modified by Gemini actions
      await fetchWorkspaceData();
      await fetchChatHistory();
    } catch (err) {
      console.error("Error sending chat message:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 5. Update Chat Message Widget state
  const updateChatMessageWidget = async (messageId, widgetData) => {
    try {
      const response = await axios.put(`${API_BASE}/chat/message/${messageId}`, {
        widget: widgetData
      });
      const updatedMessage = response.data;
      setChatHistory(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
      return updatedMessage;
    } catch (err) {
      console.error("Error updating chat message widget:", err);
      throw err;
    }
  };

  // 6. Archive Chat Card (UI action only)
  const archiveChatMessage = async (messageId) => {
    try {
      await axios.delete(`${API_BASE}/chat/message/${messageId}`);
      setChatHistory(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error("Error archiving chat message:", err);
    }
  };

  // 7. Clear Conversation History
  const clearChatHistory = async () => {
    try {
      await axios.delete(`${API_BASE}/clear`);
      setChatHistory([]);
    } catch (err) {
      console.error("Error clearing chat history:", err);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        workers,
        budgets,
        inventory,
        todos,
        schedules,
        meetings,
        emails,
        notifications,
        chatHistory,
        isChatLoading,
        saveWorkspaceItem,
        deleteWorkspaceItem,
        sendChatMessage,
        updateChatMessageWidget,
        archiveChatMessage,
        clearChatHistory,
        refreshWorkspace: fetchWorkspaceData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
