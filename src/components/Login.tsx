import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface LoginProps {
  onBack: () => void;
}

const Login = ({ onBack }: LoginProps) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin
      ? `${import.meta.env.VITE_API_URL}/api/login`
      : `${import.meta.env.VITE_API_URL}/api/register`;

    const payload = isLogin
      ? { email, password }
      : { name, phone, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Store info for use in chat page
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", data.name || "User");
      localStorage.setItem("token", data.token);

      // Redirect to chat

      navigate("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="w-18 h-12 flex items-center justify-center rounded-full overflow-hidden">
              <img
                src="/logo.png"
                alt="Madira Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <div className="w-16" />
          </div>

          <CardTitle className="text-2xl font-semibold text-gray-800 mb-2">
            {isLogin ? "" : "Create Account"}
          </CardTitle>

          <CardDescription className="text-gray-600">
            {isLogin
              ? "Login to continue your mental wellness journey"
              : "Join us for a safe and supportive conversation"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white py-6 text-lg font-medium rounded-lg transition-colors"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </Button>

            <Button
              variant="outline"
              className="w-full py-6 text-lg font-medium rounded-lg"
              // onClick={handleGuestLogin}
            >
              Login as Guest
            </Button>

            <button
              // onClick={handleForgotPassword}
              className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              Forgot Password?
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            {isLogin ? (
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Need an account? Sign up here
              </Link>
            ) : (
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Already have an account? Sign in here
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
