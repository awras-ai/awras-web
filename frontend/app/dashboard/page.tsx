import type { Metadata } from "next";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Awras dashboard",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
