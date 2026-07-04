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

  // Google Integration Connection States
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);

  // ChatGPT-style Conversations States
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

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

  // 1. Fetch conversations list
  const fetchConversationsList = async () => {
    try {
      const res = await axios.get(`${API_BASE}/conversations`);
      setConversations(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error("Error fetching conversations list:", err);
      return [];
    }
  };

  // 2. Fetch workspace items filtered by conversationId
  const fetchWorkspaceData = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await axios.get(`${API_BASE}/workspace?conversationId=${conversationId}`);
      const data = res.data;
      setWorkers(data.workers || []);
      setBudgets(data.budgets || []);
      setInventory(data.inventory || []);
      setTodos(data.todos || []);
      setSchedules(data.schedules || []);
      setMeetings(data.meetings || []);
      setEmails(data.emails || []);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
    }
  };

  // 3. Fetch chat history filtered by conversationId
  const fetchChatHistory = async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await axios.get(`${API_BASE}/chat/history?conversationId=${conversationId}`);
      setChatHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  const checkGoogleAuthStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/status`);
      setGoogleConnected(!!res.data.connected);
      setGoogleConfigured(!!res.data.configured);
    } catch (err) {
      console.error("Error checking Google authentication status:", err);
    }
  };

  // Bootstrap Conversations & Select active conversation on mount
  const bootstrapConversations = async () => {
    const list = await fetchConversationsList();
    if (list.length > 0) {
      const firstConv = list[0];
      setActiveConversationId(firstConv.id);
      await fetchWorkspaceData(firstConv.id);
      await fetchChatHistory(firstConv.id);
    } else {
      // Create default conversation if list is empty
      await createConversation();
    }
  };

  useEffect(() => {
    bootstrapConversations();
    checkGoogleAuthStatus();

    // Check redirect authentication codes
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      alert("Successfully connected your Google Workspace Account!");
      window.history.replaceState({}, document.title, window.location.pathname);
      checkGoogleAuthStatus();
    } else if (params.get("auth") === "error") {
      alert("Failed to authenticate Google Account: " + params.get("detail"));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- Conversations Handlers ---

  const createConversation = async () => {
    try {
      const res = await axios.post(`${API_BASE}/conversations`);
      const newConv = res.data;
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      
      // Clear current workspace and chat state locally immediately
      setWorkers([]);
      setBudgets([]);
      setInventory([]);
      setTodos([]);
      setSchedules([]);
      setMeetings([]);
      setEmails([]);
      setNotifications([]);
      setChatHistory([]);
      
      return newConv;
    } catch (err) {
      console.error("Error creating new conversation session:", err);
    }
  };

  const selectConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    await fetchWorkspaceData(conversationId);
    await fetchChatHistory(conversationId);
  };

  const renameConversation = async (conversationId, title) => {
    try {
      const res = await axios.put(`${API_BASE}/conversations/${conversationId}`, { title });
      const updatedConv = res.data;
      setConversations(prev => prev.map(c => c.id === conversationId ? updatedConv : c));
    } catch (err) {
      console.error("Error renaming conversation session:", err);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${API_BASE}/conversations/${conversationId}`);
      
      const remaining = conversations.filter(c => c.id !== conversationId);
      setConversations(remaining);
      
      // If the active conversation was deleted, select another one or create a new one
      if (activeConversationId === conversationId) {
        if (remaining.length > 0) {
          const nextActive = remaining[0];
          setActiveConversationId(nextActive.id);
          await fetchWorkspaceData(nextActive.id);
          await fetchChatHistory(nextActive.id);
        } else {
          await createConversation();
        }
      }
    } catch (err) {
      console.error("Error deleting conversation session:", err);
    }
  };

  const connectGoogle = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/url`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      alert("Google Connection Failed: " + (err.response?.data?.detail || err.message));
    }
  };

  // 2. Add / Edit Workspace Item
  const saveWorkspaceItem = async (category, item) => {
    try {
      const endpoint = `${API_BASE}/${category}`;
      let response;
      
      const payload = { ...item };
      // Scopes the item to the active conversation during creation
      if (!payload.id && activeConversationId) {
        payload.conversationId = activeConversationId;
      }

      if (item.id) {
        // Edit flow
        response = await axios.put(`${endpoint}/${item.id}`, payload);
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
        response = await axios.post(endpoint, payload);
        const createdItem = response.data;
        const { setter } = stateMap[category];
        setter(prev => [...prev, createdItem]);
        return createdItem;
      }
    } catch (err) {
      console.error(`Error saving workspace item in ${category}:`, err);
      // Intercept Google 401 auth failures
      if (err.response && err.response.status === 401) {
        setGoogleConnected(false);
        if (window.confirm("Google integration requires authentication. Redirect to Google Accounts login page now?")) {
          connectGoogle();
        }
      }
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
    if (!text.trim() || !activeConversationId) return;
    
    // Add user message to state immediately for immediate UX response
    const tempUserMsg = { id: "temp-user", role: "user", text, widget: null };
    setChatHistory(prev => [...prev, tempUserMsg]);
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { 
        message: text,
        conversationId: activeConversationId
      });
      const aiMessage = response.data;
      
      // Append AI message and sync user message
      setChatHistory(prev => {
        const filtered = prev.filter(m => m.id !== "temp-user");
        return [...filtered, { id: "temp-user-sync", role: "user", text }, aiMessage];
      });
      
      // Sync list to pick up auto-generated title or updatedAt timestamps
      await fetchConversationsList();
      await fetchWorkspaceData(activeConversationId);
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
    if (!activeConversationId) return;
    try {
      await axios.delete(`${API_BASE}/chat/clear?conversationId=${activeConversationId}`);
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
        googleConnected,
        googleConfigured,
        conversations,
        activeConversationId,
        createConversation,
        selectConversation,
        renameConversation,
        deleteConversation,
        connectGoogle,
        saveWorkspaceItem,
        deleteWorkspaceItem,
        sendChatMessage,
        updateChatMessageWidget,
        archiveChatMessage,
        clearChatHistory,
        refreshWorkspace: () => fetchWorkspaceData(activeConversationId),
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
