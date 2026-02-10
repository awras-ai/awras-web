"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RegistrationProvider,
  Step1Form,
  Step2Form,
  RegistrationProgress,
} from "../signup/components";

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <RegistrationProvider>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
            <RegistrationProgress currentStep={step} />
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <Step1Form
                    onNext={() => setStep(2)}
                  />
                )}
                {step === 2 && (
                  <Step2Form
                    onComplete={() => {
                      router.push("/dashboard");
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </RegistrationProvider>
  );
}
