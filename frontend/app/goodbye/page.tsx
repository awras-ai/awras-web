"use client";

import { motion } from "framer-motion";
import { Mail, Instagram, Home } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GoodbyePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Demo Period Ended</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              The awras-chat demo is now offline.
            </p>

            <p className="text-foreground">
              We have your email and will contact you when our next releases are ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <a
                  href="mailto:awras.ai.dz@gmail.com"
                  className="flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <a
                  href="https://instagram.com/awras.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  @awras.ai
                </a>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button variant="ghost" asChild>
              <a href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Return to Home
              </a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
