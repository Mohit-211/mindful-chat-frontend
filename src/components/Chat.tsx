import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, LogOut } from "lucide-react";
import { Message as ChatMessage } from "../types";

const Chat = () => {
  const [model, setModel] = useState<"openai" | "ollama">("openai");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hello! I'm here to listen and support you. Feel free to share what's on your mind, and remember - this is a safe, judgment-free space. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("User");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth check and user name fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUserName(data.name || "User"))
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch chat history");

        const data = await res.json();
        const chats = data.chats.reverse(); // Chronological order

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
        console.error("Could not load chat history:", err);
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: inputMessage, model }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I couldn’t understand that.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
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
    if (!window.confirm("Are you sure you want to end this chat session?"))
      return;

    const token = localStorage.getItem("token");

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    }

    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">💙</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">Welcome, {userName}</h1>
            <p className="text-xs text-gray-500">
              You're chatting with MindCare
            </p>
          </div>
        </div>
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

      {/* Model Selector */}
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

      {/* Chat Window */}
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
              <p className="text-sm leading-relaxed">{msg.text}</p>
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
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
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
          This is a supportive AI assistant. For emergencies, please contact
          local emergency services.
        </p>
      </div>
    </div>
  );
};

export default Chat;
