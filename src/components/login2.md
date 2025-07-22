return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">💙</span>
            </div>
            <div className="w-16"></div>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800 mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isLogin
              ? "Sign in to continue your mental wellness journey"
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
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              {isLogin
                ? "Need an account? Sign up here"
                : "Already have an account? Sign in here"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
