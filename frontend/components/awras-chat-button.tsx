"use client";

import { useState } from "react";
import { Bell, Lock, HelpCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function AwrasChatButton() {
  const [isReminderSet, setIsReminderSet] = useState(false);

  const handleBellClick = () => {
    if (isReminderSet) {
      toast.info("You have already set a reminder!");
      return;
    }

    // Store reminder in localStorage
    localStorage.setItem("awrasChatReminder", "true");
    setIsReminderSet(true);
    
    toast.success("Reminder set!", {
      description: "We'll notify you when Awras-Chat launches on February 15, 2026.",
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Bell Reminder Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12"
        onClick={handleBellClick}
        title="Remind me when Awras-Chat is live"
      >
        {isReminderSet ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </Button>

      {/* Main Locked Button */}
      <Button
        variant="default"
        size="lg"
        className="h-12 px-8 text-lg"
        disabled
      >
        <Lock className="h-5 w-5 mr-2" />
        Awras-Chat
        <span className="ml-2 text-sm text-muted-foreground">(Coming Feb 15)</span>
      </Button>

      {/* Info Dialog Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            title="What is Awras-Chat?"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">What is Awras-Chat?</DialogTitle>
            <DialogDescription className="text-base pt-4">
              <div className="space-y-4">
                <p>
                  <strong>Awras-Chat</strong> is our Algerian LLM (Large Language Model) 
                  platform that understands and responds in Algerian Darija dialect.
                </p>
                
                <div className="bg-muted p-4 border">
                  <p className="font-medium mb-2">You will be able to:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Chat with the AI in Darija and other languages</li>
                    <li>Test the model&apos;s capabilities and responses</li>
                    <li>Provide feedback to help us improve</li>
                    <li>Be part of the first wave of testers</li>
                  </ul>
                </div>

                <p className="text-center font-medium text-lg">
                  Launching February 15, 2026! 🚀
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
