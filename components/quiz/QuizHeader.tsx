"use client";

import { Play, Edit, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface QuizHeaderProps {
  title: string;
  description: string;
  questionsCount: number;
  playsCount: string;
  image: string;
  category: string;
}

export default function QuizHeader({
  title,
  description,
  questionsCount,
  playsCount,
  image,
  category,
}: QuizHeaderProps) {
  return (
    <section className="bg-white rounded-xl overflow-hidden shadow-md border border-outline-variant mb-8">
      <div className="relative h-64 w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-4 right-4">
          <span className="bg-primary text-white px-3 py-1 rounded-full font-bold text-xs shadow-md uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">
              {title}
            </h1>
            <p className="text-on-surface-variant mb-6 text-lg">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg border border-outline-variant">
                <Zap size={18} className="text-primary fill-primary" />
                <span className="font-bold text-sm">
                  {questionsCount} Questions
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg border border-outline-variant">
                <Play size={18} className="text-primary fill-primary" />
                <span className="font-bold text-sm">{playsCount} Plays</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-secondary-container text-on-secondary-container font-headline text-xl px-8 py-4 rounded-xl btn-3d flex items-center justify-center gap-2 w-full"
            >
              <Play size={24} fill="currentColor" />
              Start Game
            </motion.button>
            <button className="bg-surface-container-high text-on-surface font-bold px-8 py-3 rounded-xl border-2 border-outline hover:bg-surface-variant transition-all flex items-center justify-center gap-2">
              <Edit size={18} />
              Edit Quiz
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
