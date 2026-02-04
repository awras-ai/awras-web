"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRegistration } from "../../signup/components/RegistrationContext";
import { useVerifyEmail } from "@/hooks/useAuth";

const step2Schema = z.object({
  code: z.string().length(6, "Please enter the 6-digit code"),
});

interface Step2FormProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Form({ onNext, onBack }: Step2FormProps) {
  const { data } = useRegistration();
  const mutation = useVerifyEmail();

  const form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      code: "",
    },
  });

  function onSubmit(values: z.infer<typeof step2Schema>) {
    mutation.mutate(
      { code: values.code, email: data.email },
      {
        onSuccess: () => {
          onNext();
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to
          </p>
          <p className="font-medium">{data.email}</p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="border-2 border-black rounded-md"
                    />
                    <InputOTPSlot
                      index={1}
                      className="border-2 border-black rounded-md"
                    />
                    <InputOTPSlot
                      index={2}
                      className="border-2 border-black rounded-md"
                    />
                    <InputOTPSlot
                      index={3}
                      className="border-2 border-black rounded-md"
                    />
                    <InputOTPSlot
                      index={4}
                      className="border-2 border-black rounded-md"
                    />
                    <InputOTPSlot
                      index={5}
                      className="border-2 border-black rounded-md"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={mutation.isPending}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500 text-center">
            {mutation.error.message}
          </p>
        )}
      </form>
    </Form>
  );
}
