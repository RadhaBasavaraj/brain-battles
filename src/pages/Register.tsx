import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(userName)) {
      setError("User Name can contain only alphabets");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
     // await base44.auth.register({ email, password });
     const { data, error } = await supabase.auth.signUp({
        email,
        password,
          options: {
                 emailRedirectTo: "http://localhost:5173/login",
                   data: {
                            full_name: userName,
                          },
                  },
       });

      if(error){
        throw error;
      }

      if (!data.user || data.user.identities?.length === 0) {
              setError("An account with this email already exists. Please log in instead.");
              return;
       }
      //setShowOtp(true);
      setRegistrationComplete(true);
      console.log("Signup response:", data);
console.log("Signup error:", error);

    } catch (err) {
        if(err instanceof Error){
          setError(err.message);
        }else{
          setError("Invalid verification link");
        }
    } finally {
      setLoading(false);
    }
  };

 

  const handleGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
           queryParams: {
                    prompt: "select_account",
                  },
        },
      });

      if (error) {
        setError(error.message);
      }
  };

  
if (registrationComplete) {
  return (
    <AuthLayout
      icon={Mail}
      title="Verify your email"
      subtitle={`We sent a verification link to ${email}`}
    >
      {/* {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )} */}

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Your account has been created successfully.
        </p>

        <p className="text-sm text-muted-foreground">
          Please check your email and click the verification link
          to activate your account.
        </p>
      </div>
    </AuthLayout>
  );
}


  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName">User Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="userName"
              type="text"
              autoComplete="text"
              autoFocus
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
          <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}