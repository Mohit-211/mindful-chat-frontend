import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, LogOut, MessageSquare } from "lucide-react";
import { Message as ChatMessage } from "../types";

const Chat = () => {
  const [model, setModel] = useState<"openai" | "ollama">("openai");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hello! I'm here to listen and support you. Feel free to share what's on your mind, and remember – this is a safe, judgment-free space. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState("");

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- SUPER VERBOSE MOUNT LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const guestName = localStorage.getItem("guestName");
    const guestIdStored = localStorage.getItem("guestId");

    console.log("[MOUNT] Chat.tsx");
    console.log("[MOUNT] token:", token);
    console.log("[MOUNT] guestName:", guestName);
    console.log("[MOUNT] guestIdStored:", guestIdStored);

    if (token) {
      console.log("[MOUNT] Detected token. Fetching /api/me ...");
      fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          console.log("[MOUNT] /api/me response status:", res.status);
          if (!res.ok) throw new Error(`Unauthorized - ${res.status}`);
          return res.json();
        })
        .then((data) => {
          console.log("[MOUNT] /api/me data:", data);
          setUserName(data.name || "User");
          setUserId(data.id);
        })
        .catch((e) => {
          console.log(
            "[MOUNT] Token fetch failed. Removing and redirecting.",
            e
          );
          localStorage.removeItem("token");
          window.location.href = "/";
        });
    } else if (guestName && guestIdStored) {
      console.log("[MOUNT] Detected guest mode.");
      setIsGuest(true);
      setUserName(guestName);
      setGuestId(guestIdStored);
    } else {
      console.log(
        "[MOUNT] Redirecting because missing keys:",
        "guestName:",
        guestName,
        "guestIdStored:",
        guestIdStored,
        "token:",
        token
      );
      window.location.href = "/";
    }
  }, []);

  // Load previous chat history (for logged-in users only)
  useEffect(() => {
    console.log(
      "[HISTORY] useEffect triggered. userId:",
      userId,
      "isGuest:",
      isGuest
    );
    if (!userId || isGuest) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchChatHistory = async () => {
      try {
        console.log("[HISTORY] Fetching chat history for user.");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("[HISTORY] Fetch status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        const chats = data.chats.reverse();
        if (!chats.length) return;

        const formattedMessages: ChatMessage[] = [];
        chats.forEach((chat: any) => {
          const time = new Date(chat.created_at);
          formattedMessages.push({
            id: `${chat.id}-user`,
            text: chat.message,
            isUser: true,
            timestamp: time,
          });
          formattedMessages.push({
            id: `${chat.id}-bot`,
            text: chat.response,
            isUser: false,
            timestamp: time,
          });
        });

        setMessages(formattedMessages);
      } catch (err) {
        console.log("[HISTORY] Error, clearing token and redirecting.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchChatHistory();
  }, [userId, isGuest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Feedback status
  useEffect(() => {
    console.log(
      "[FEEDBACK] Checking feedback status. userId:",
      userId,
      "isGuest:",
      isGuest,
      "hasGivenFeedback:",
      hasGivenFeedback,
      "guestId:",
      guestId
    );
    if ((!userId && !isGuest) || hasGivenFeedback) return;

    const feedbackUrl = isGuest
      ? `/api/guest/feedback/status?guestId=${guestId}`
      : `/api/feedback`;

    const headers: any = isGuest
      ? {}
      : { Authorization: `Bearer ${localStorage.getItem("token")}` };

    fetch(`${import.meta.env.VITE_API_URL}${feedbackUrl}`, { headers })
      .then((res) => {
        console.log("[FEEDBACK] Fetch status:", res.status);
        if (!res.ok) throw new Error("Feedback check failed");
        return res.json();
      })
      .then((data) => {
        console.log("[FEEDBACK] Received data:", data);
        setHasGivenFeedback(data.hasFeedback);
      })
      .catch((e) => {
        console.log("[FEEDBACK] Error checking feedback:", e);
      });
  }, [userId, isGuest, guestId]);

  // Prompt feedback on tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasGivenFeedback) {
        console.log("[UNLOAD] Prompting feedback modal.");
        e.preventDefault();
        e.returnValue = "";
        setShowFeedbackModal(true);
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasGivenFeedback]);

  // Send message handler (user or guest)
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      let url = "";
      let payload: any = {};
      let headers: any = { "Content-Type": "application/json" };

      if (isGuest) {
        url = "/api/guest/chat";
        payload = { guestId, message: inputMessage, model: "openai" };
        console.log("[SEND] Sending as guest:", payload);
      } else {
        url = "/api/chat";
        payload = { message: inputMessage, model };
        headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
        console.log("[SEND] Sending as user:", payload);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      console.log("[SEND] Response status:", res.status);

      const data = await res.json();
      console.log("[SEND] Data received:", data);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text:
          data.response || data.reply || "Sorry, I couldn’t understand that.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log("[SEND] Error in sendMessage:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting right now.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEndChat = async () => {
    if (hasGivenFeedback) return logout();
    const confirmExit = window.confirm(
      "Would you like to leave feedback before ending the chat?"
    );
    if (confirmExit) {
      setShowFeedbackModal(true);
    } else {
      logout();
    }
  };

  const logout = async () => {
    console.log("[LOGOUT] Logging out user. isGuest:", isGuest);
    if (!isGuest) {
      const token = localStorage.getItem("token");
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {}
      localStorage.removeItem("token");
    }
    localStorage.removeItem("guestName");
    localStorage.removeItem("guestId");
    window.location.href = "/";
  };

  const submitFeedback = async () => {
    const url = isGuest ? "/api/guest/feedback" : "/api/feedback";

    const headers: any = {
      "Content-Type": "application/json",
    };

    const body = isGuest
      ? {
          guestId,
          guestName: userName,
          feedback: feedbackText,
        }
      : {
          feedback: feedbackText,
        };

    if (!isGuest) {
      headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }
    console.log("[FEEDBACK] Submitting feedback", body);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit feedback.");
        return;
      }

      setHasGivenFeedback(true);
      setShowFeedbackModal(false);
      alert("Thank you for your feedback!");
    } catch (err) {
      alert("There was an issue submitting your feedback. Please try again.");
    }
  };

  // --- END VERBOSE LOGS ---

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="font-semibold text-gray-800">Welcome, {userName}</h1>
            <p className="text-xs text-gray-500">
              You're chatting with Madira AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFeedbackModal(true)}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
            disabled={hasGivenFeedback}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Feedback
          </Button>
          <Button
            onClick={handleEndChat}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4 mr-1" />
            End Chat
          </Button>
        </div>
      </div>

      {/* Model Selector */}
      {!isGuest && (
        <div className="px-4 pt-2">
          <label className="text-sm text-gray-600 mr-2">Choose Model:</label>
          <select
            className="text-sm border rounded px-2 py-1 text-gray-700"
            value={model}
            onChange={(e) => setModel(e.target.value as "ollama" | "openai")}
          >
            <option value="ollama">Ollama</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-[80%] md:max-w-[60%] p-4 ${
                msg.isUser
                  ? "bg-blue-400 text-white border-blue-400"
                  : "bg-white/80 text-gray-800 border-gray-200"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-2 ${
                  msg.isUser ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {msg.timestamp?.toLocaleTimeString?.([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-white/80 text-gray-800 border-gray-200 p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-400 hover:bg-blue-500 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This is a supportive AI assistant. For emergencies, contact local
          services.
        </p>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              We'd love your feedback!
            </h2>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={4}
              placeholder="How was your experience?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitFeedback} disabled={!feedbackText.trim()}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

console.log("Chat component module loaded!");

export default Chat;
