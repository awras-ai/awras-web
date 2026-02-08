"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ComparisonCardProps {
    modelName: string;
    response: string;
    isAwras?: boolean;
    accuracy: number;
}

function ComparisonCard({ modelName, response, isAwras, accuracy }: ComparisonCardProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
                isAwras
                    ? "bg-black text-white border-black shadow-xl scale-105 z-10"
                    : "bg-white text-black border-neutral-200 hover:border-neutral-300 hover:bg-gray-50"
            )}
        >
            {isAwras && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Recommended
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-lg font-bold", isAwras ? "text-white" : "text-neutral-900")}>
                    {modelName}
                </h3>

            </div>

            <p className={cn(
                "text-sm leading-relaxed mb-6 font-medium",
                isAwras ? "text-neutral-200" : "text-neutral-600"
            )} dir="rtl">
                "{response}"
            </p>

            <div className="mt-auto pt-4 border-t border-dashed border-opacity-20 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className={cn("text-[10px] uppercase tracking-wider mb-1", isAwras ? "text-neutral-400" : "text-neutral-400")}>
                        Authenticity
                    </span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div
                                key={star}
                                className={cn(
                                    "w-8 h-1 rounded-full",
                                    star <= (accuracy / 20)
                                        ? (isAwras ? "bg-white" : "bg-black")
                                        : (isAwras ? "bg-white/20" : "bg-neutral-200")
                                )}
                            />
                        ))}
                    </div>
                </div>
                <div className={cn("text-2xl font-black", isAwras ? "text-white" : "text-neutral-900")}>
                    {accuracy}%
                </div>
            </div>
        </div>
    );
}

export function ModelComparisonSection() {
    return (
        <section className="py-24 bg-neutral-50" id="comparison">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                        Native vs. The Rest
                    </h2>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        See the difference between standard Arabic LLMs and Awras when handling
                        authentic Algerian Darija.
                    </p>
                </div>

                {/* The Prompt */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">
                                Q
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest mb-2">The Prompt</p>
                                <p className="text-xl md:text-2xl font-medium text-neutral-900" dir="rtl">
                                    "واش هي مكونات الشوربة الوهرانية؟"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparisons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Generic Model */}
                    <ComparisonCard
                        modelName="fanar"
                        response="تتكون الشوربة الوهرانية من حمص، فول، عدس، بصل، ثوم، طماطم، توابل، وملح وفلفل حار، مع إمكانية إضافة لحم أو خضروات أخرى حسب الرغبة."
                        accuracy={65}
                    />

                    {/* Awras (Center, Highlighted) */}
                    <ComparisonCard
                        modelName="Awras"
                        response="الشوربة الوهرانية، يا حصراه على البنة! لازمك لحم غنمي، فريك، طماطم مصبرة، بصل، ثوم، قصبر، كرافس، حمص طايب، وتوابل كيما فلفل كحل، قرفة، وزعفران. وما تنسايش شوية زيت وسمن باش تجي ميدمة وبنينة."
                        isAwras={true}
                        accuracy={98}
                    />

                    {/* Silma AI or similar */}
                    <ComparisonCard
                        modelName="Silma 9B"
                        response="أجيبك، المكونات هما الدجاج، البرز، الكرمط، اللوز، الطعمه، البهارات وما لوشو غزل."
                        accuracy={85}
                    />
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-neutral-500">
                        * Comparison based on cultural nuance and dialect authenticity.
                    </p>
                </div>
            </div>
        </section>
    );
}
