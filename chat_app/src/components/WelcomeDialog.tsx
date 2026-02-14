import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "awras-welcome-seen";
const TOTAL_STEPS = 3;

const stepContent = [
  {
    title: "Meet AWRAS",
    description: (
      <div className="space-y-3 text-left">
        <p className="text-base">
          Welcome to <span className="font-semibold">awras-chat-v0</span>, a
          fine-tuned small language model with 4B parameters.
        </p>
        <p className="text-sm text-muted-foreground">
          This model has been specifically trained to understand and generate
          Algerian Darija.
        </p>
      </div>
    ),
  },
  {
    title: "What to Expect",
    description: (
      <div className="space-y-3 text-left">
        <p className="text-base">
          <span className="font-semibold">Not great at general knowledge</span>{" "}
          - it wasn't included in the training data.
        </p>
        <p className="text-base">
          <span className="font-semibold">Excellent Darja fluency</span> -
          natural Algerian Darija conversations.
        </p>
        <p className="text-base">
          <span className="font-semibold">
            Great English to Darja translation
          </span>{" "}
          - accurate and contextual translations.
        </p>
      </div>
    ),
  },
  {
    title: "Help Us Improve",
    description: (
      <div className="space-y-3 text-left">
        <p className="text-base font-semibold">
          Test it, Break it, and give us your feedback!
        </p>
        <p className="text-sm text-muted-foreground">
          We need and appreciate your feedback to make AWRAS better. Try
          different questions, explore its capabilities, and let us know what
          works and what doesn't.
        </p>
      </div>
    ),
  },
];

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - close dialog
      localStorage.setItem(STORAGE_KEY, "true");
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[600px] data-[state=open]:animate-none data-[state=closed]:animate-none"
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {stepContent[currentStep].title}
          </DialogTitle>
          <DialogDescription className="pt-4">
            {stepContent[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex-1 sm:flex-none"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext} className="flex-1 sm:flex-none">
            {isLastStep ? "Start Chatting" : "Next"}
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
