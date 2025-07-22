import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Login from "@/components/Login";
import Chat from "@/components/Chat";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Chat />;
  }

  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-40 h-18 mb-4 animate-fadeIn drop-shadow-md">
            <img
              src="/logo.png"
              alt="Madira Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome to a <span className="text-blue-500">Mindful ChatBot</span>
          </h1>
          <CardDescription className="text-gray-600 text-base leading-relaxed mt-2">
            Your private, always-available space to express, reflect, and find
            support through compassionate AI conversations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              🌟 100% Anonymous & Confidential
            </p>
            <p className="text-sm text-gray-600">
              🤝 Available Anytime, Anywhere
            </p>
            <p className="text-sm text-gray-600">
              💬 Safe, Non-Judgmental Conversations
            </p>
          </div>

          <Button
            onClick={() => setShowLogin(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 text-lg font-semibold rounded-xl transition-all duration-200"
          >
            Start Talking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <LandingPage />
    </AuthProvider>
  );
};

export default Index;
