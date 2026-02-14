// "use client";
//
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Loader2, Sparkles } from "lucide-react";
//
// import { useCurrentUser } from "@/hooks/useAuth";
// import { Card, CardContent } from "@/components/ui/card";
// import { CountdownTimer } from "@/components/countdown";
// import { AwrasChatButton } from "@/components/awras-chat-button";
//
// export default function DashboardPage() {
//   const router = useRouter();
//   const { data: user, isLoading, isError, error } = useCurrentUser();
//
//   // Target date: February 15, 2026
//   const launchDate = new Date("2026-02-15T00:00:00");
//
//   useEffect(() => {
//     if (isError && error?.message === "Unauthorized") {
//       router.push("/login");
//     }
//   }, [isError, error, router]);
//
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }
//
//   if (isError && error?.message === "Unauthorized") {
//     return null;
//   }
//
//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardContent className="pt-6 text-center">
//             <p className="text-lg font-medium">Error</p>
//             <p className="text-muted-foreground">
//               {error?.message || "Failed to load user data"}
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }
//
//   if (!user) {
//     return null;
//   }
//
//   return (
//     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
//       <div className="max-w-5xl w-full space-y-12">
//         {/* Welcome Section */}
//         <div className="text-center space-y-4">
//           <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
//             <Sparkles className="h-5 w-5" />
//             <span className="text-sm tracking-widest uppercase">
//               Welcome to Awras
//             </span>
//             <Sparkles className="h-5 w-5" />
//           </div>
//
//           <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
//             Welcome, {user.first_name} {user.last_name}!
//           </h1>
//
//           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//             Thank you for joining us. We&apos;re excited to have you on board!
//           </p>
//         </div>
//
//         {/* Countdown Section */}
//         <div className="space-y-6">
//           <div className="text-center space-y-2">
//             <h2 className="text-2xl md:text-3xl font-semibold">
//               Awras-Chat Launch
//             </h2>
//             <p className="text-muted-foreground">
//               Our Algerian LLM platform is launching soon
//             </p>
//           </div>
//
//           <CountdownTimer targetDate={launchDate} />
//         </div>
//
//         {/* Awras-Chat Button Section */}
//         <div className="flex flex-col items-center space-y-4">
//           <p className="text-sm text-muted-foreground">
//             Get ready to experience our Algerian LLM
//           </p>
//           <AwrasChatButton />
//         </div>
//
//         {/* Footer Info */}
//         <div className="text-center text-sm text-muted-foreground pt-8 border-t">
//           <p>Signed in as {user.email}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
