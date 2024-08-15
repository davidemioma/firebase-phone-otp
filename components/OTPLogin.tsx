"use client";

import React, { useEffect, useState, useTransition } from "react";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OTPLogin = () => {
  const router = useRouter();

  const [otp, setOtp] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [success, setSuccess] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [resendCountdown, setResendCountdown] = useState(0);

  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [isPending, startTransition] = useTransition();

  // Start timer
  useEffect(() => {
    let timer: any;

    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Setup captcha for security
  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, [auth]);

  const requestOTP = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setError(null);

    setSuccess("");

    setResendCountdown(60);

    startTransition(async () => {
      if (!recaptchaVerifier) {
        return setError("Recaptcha Verifier is not initialized.");
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier
        );

        setConfirmationResult(confirmationResult);

        setSuccess("OTP sent successfully!");
      } catch (err: any) {
        setResendCountdown(0);

        if (err.code === "auth/invalid-phone-number") {
          setError(
            "Invalid phone number! Please Try again with a valid number."
          );
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many requests! Please Try again later.");
        } else {
          setError(
            "Something went wrong! Failed to send OTP, Please Try again."
          );
        }

        console.log("SEND OTP", err);
      }
    });
  };

  //Verify OTP
  const verifyOTP = async () => {
    startTransition(async () => {
      setError(null);

      if (!confirmationResult) {
        setError("Please request OTP first.");

        return;
      }

      try {
        await confirmationResult?.confirm(otp);

        router.replace("/");
      } catch (err) {
        setError("Faile to verify OTP, Please check OTP.");

        console.log("VERIFY_OTP", err);
      }
    });
  };

  //Use effect to verify OTP
  useEffect(() => {
    const otpValid = otp.length === 6;

    if (otpValid) {
      verifyOTP();
    }
  }, [otp]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center">
        {!confirmationResult && (
          <form onSubmit={requestOTP}>
            <div className="flex flex-col w-full gap-2 items-center">
              <Input
                className="text-black"
                id="phoneNumber"
                type="tel"
                placeholder="+44 **** **** **"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isPending}
              />

              <Label htmlFor="phoneNumber" className="text-xs text-zinc-500">
                Please enter your number with your country code (i.e. +44 for
                UK)
              </Label>
            </div>
          </form>
        )}

        {confirmationResult && (
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />

              <InputOTPSlot index={1} />

              <InputOTPSlot index={2} />
            </InputOTPGroup>

            <InputOTPSeparator />

            <InputOTPGroup>
              <InputOTPSlot index={3} />

              <InputOTPSlot index={4} />

              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        )}

        <Button
          className="mt-5"
          onClick={() => requestOTP()}
          disabled={resendCountdown > 0 || isPending || !phoneNumber.trim()}
        >
          {resendCountdown > 0
            ? `Resend OTP in ${resendCountdown}`
            : isPending
            ? "Sending OTP..."
            : "Send OTP"}
        </Button>

        <div className="p-5 text-center text-sm font-semibold">
          {error && <p className="text-red-500">{error}</p>}

          {success && <p className="text-green-500">{success}</p>}
        </div>

        {isPending && <Loader2 className="w-10 h-10 animate-spin" />}
      </div>

      <div id="recaptcha-container" />
    </div>
  );
};

export default OTPLogin;
