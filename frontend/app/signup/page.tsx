"use client";

import { useRouter } from "next/navigation";

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
  RegistrationProgress,
} from "../signup/components";

export default function RegistrationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/goodbye");
  };

  return (
    <RegistrationProvider>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
            <RegistrationProgress currentStep={1} />
          </CardHeader>
          <CardContent>
            <Step1Form onComplete={handleSuccess} />
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
