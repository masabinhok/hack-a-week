// ============================================
// FILE: app/login/page.tsx
// DESCRIPTION: Phone-based login/register page with OTP
// ============================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Loader2, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtp, verifyOtp, isValidNepaliPhone } from "@/lib/auth";

type Step = "phone" | "otp" | "success";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone number
    if (!isValidNepaliPhone(phoneNumber)) {
      setError("Please enter a valid Nepali mobile number (e.g., 9801234567)");
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(phoneNumber);
      setStep("otp");
      setCountdown(300); // 5 minutes
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(phoneNumber, otp);
      console.log('OTP Verification Response:', result);
      
      // Check if user object exists
      if (!result || !result.user) {
        console.error('Invalid response structure:', result);
        throw new Error('Invalid response from server');
      }
      
      setIsNewUser(result.user.isNewUser || false);
      login(result.user);
      setStep("success");
      
      // Redirect after short delay
      setTimeout(() => {
        if (result.user.isNewUser) {
          router.push("/profile?setup=true");
        } else {
          router.push("/my-services");
        }
      }, 1500);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError("");
    try {
      await sendOtp(phoneNumber);
      setCountdown(300);
      setOtp("");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-secondary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            सेतु <span className="text-nepal-crimson">Setu</span>
          </h1>
          <p className="text-foreground-secondary mt-2">
            Your gateway to government services
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {step === "success" ? (
                <>
                  <CheckCircle className="h-6 w-6 text-success" />
                  Welcome!
                </>
              ) : (
                <>
                  <Shield className="h-6 w-6 text-nepal-blue" />
                  {step === "phone" ? "Login / Register" : "Verify OTP"}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === "phone" && "Enter your phone number to continue"}
              {step === "otp" && `Enter the 6-digit code sent to ${phoneNumber}`}
              {step === "success" && (isNewUser ? "Account created successfully!" : "Login successful!")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    icon={<Phone className="h-4 w-4" />}
                    error={!!error}
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-xs text-foreground-muted">
                    Enter your Nepali mobile number (NTC/Ncell)
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-error">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || phoneNumber.length !== 10}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-foreground">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    error={!!error}
                    disabled={isLoading}
                    autoFocus
                    className="text-center text-2xl tracking-widest"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">
                      {countdown > 0 ? (
                        `Code expires in ${formatCountdown(countdown)}`
                      ) : (
                        "Code expired"
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-nepal-blue hover:text-nepal-blue-dark disabled:text-foreground-muted disabled:cursor-not-allowed"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-error">{error}</p>
                )}

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                  >
                    Change Phone Number
                  </Button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <p className="text-foreground-secondary">
                  {isNewUser 
                    ? "Redirecting to complete your profile..."
                    : "Redirecting to your services..."}
                </p>
                <Loader2 className="h-5 w-5 animate-spin mx-auto mt-4 text-nepal-blue" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-foreground-secondary">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-nepal-blue hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-nepal-blue hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Dev Mode Info
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <p className="font-medium text-amber-800">🔧 Development Mode</p>
            <p className="text-amber-700 mt-1">
              OTP codes are logged to the server console. Check your terminal for the code.
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
}
