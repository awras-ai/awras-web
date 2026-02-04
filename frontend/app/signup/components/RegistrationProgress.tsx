import { Progress } from "@/components/ui/progress";

interface RegistrationProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function RegistrationProgress({
  currentStep,
  totalSteps = 3,
}: RegistrationProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground text-center">
        Step {currentStep} of {totalSteps}
      </p>
      <Progress value={progress} />
    </div>
  );
}
