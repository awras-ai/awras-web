"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
}

function calculateTimeLeft(targetDate: Date): {
  timeLeft: TimeLeft;
  isLaunched: boolean;
} {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      isLaunched: true,
      timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    };
  }

  return {
    isLaunched: false,
    timeLeft: {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    },
  };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const { timeLeft } = calculateTimeLeft(targetDate);
    return timeLeft;
  });
  const [isLaunched, setIsLaunched] = useState(() => {
    const { isLaunched } = calculateTimeLeft(targetDate);
    return isLaunched;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const { timeLeft, isLaunched } = calculateTimeLeft(targetDate);
      setTimeLeft(timeLeft);
      setIsLaunched(isLaunched);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isLaunched) {
    return (
      <div className="text-center">
        <div className="text-6xl md:text-8xl font-bold mb-4">
          🎉 Launched! 🎉
        </div>
        <p className="text-xl text-muted-foreground">
          Awras-Chat is now live! Check it out below.
        </p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINUTES" },
    { value: timeLeft.seconds, label: "SECONDS" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {timeUnits.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center justify-center p-6 "
        >
          <span className="text-4xl md:text-6xl lg:text-7xl font-bold tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-sm md:text-base text-muted-foreground mt-2 tracking-wider">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
