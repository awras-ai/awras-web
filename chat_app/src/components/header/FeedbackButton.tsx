import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const borderGlowAnimation = `
@keyframes borderGlow {
  0%, 90% { 
    box-shadow: none;
    border-color: transparent;
  }
  5% { 
    box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.3), 0 0 16px 4px rgba(0, 0, 0, 0.15);
    border-color: rgba(0, 0, 0, 0.4);
  }
  10% { 
    box-shadow: none;
    border-color: transparent;
  }
  100% { 
    box-shadow: none;
    border-color: transparent;
  }
}
`;

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter feedback before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/submit-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ feedback }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const data = await response.json();
      toast.success(data.message || "Feedback submitted successfully!");
      setFeedback("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback("");
    setIsOpen(false);
  };

  return (
    <>
      <style>{borderGlowAnimation}</style>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id="feedback-button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-muted-foreground border-2 border-transparent"
              style={{
                animation: "borderGlow 15s infinite",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
              }}
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="!size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share Your Feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>

          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Be ruthless! We want to hear it all."
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
