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
      <div className="space-y-2 sm:space-y-3 text-left">
        <p className="text-sm sm:text-base leading-relaxed">
          Welcome to <span className="font-semibold">awras-chat-v0</span>, a
          fine-tuned small language model with 4B parameters.
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          This model has been specifically trained to understand and generate
          Algerian Darija.
        </p>
      </div>
    ),
  },
  {
    title: "What to Expect",
    description: (
      <div className="space-y-2 sm:space-y-3 text-left">
        <p className="text-sm sm:text-base leading-relaxed">
          <span className="font-semibold">Not great at general knowledge</span>{" "}
          - it wasn't included in the training data.
        </p>
        <p className="text-sm sm:text-base leading-relaxed">
          <span className="font-semibold">Excellent Darja fluency</span> -
          natural Algerian Darija conversations.
        </p>
        <p className="text-sm sm:text-base leading-relaxed">
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
      <div className="space-y-2 sm:space-y-3 text-left">
        <p className="text-sm sm:text-base font-semibold leading-relaxed">
          Test it, Break it, and give us your feedback!
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
        className="w-[90vw] max-w-[600px] data-[state=open]:animate-none data-[state=closed]:animate-none p-4 sm:p-6"
        hideClose
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl sm:text-2xl leading-tight">
            {stepContent[currentStep].title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {stepContent[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 sm:py-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex-1 sm:flex-none min-w-0"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Button 
            onClick={handleNext} 
            className="flex-1 sm:flex-none min-w-0"
            size="sm"
          >
            <span className="truncate">
              {isLastStep ? "Start Chatting" : "Next"}
            </span>
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
