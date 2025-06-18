"use client";

import { useState, useEffect } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export function TextToSpeech({ text, className }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);
    }
  }, []);

  const detectLanguage = (text: string): string => {
    // Check for Urdu/Arabic script
    const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    if (urduPattern.test(text)) {
      return "ur-PK";
    }

    // Check for Roman Urdu patterns
    const romanUrduPatterns = [
      /\b(aap|ap|hum|main|mein|hai|hain|ka|ki|ke|ko|se|par|or|aur|kya|kaise|kahan|kab|kyun|jo|jis|agar|lekin|phir|abhi|yahan|wahan|yeh|ye|woh|wo|iska|uska|hamara|tumhara|apka)\b/i,
      /\b(batao|bataiye|samjhao|samjhaiye|dekho|dekhiye|suno|suniye|karo|kariye|acha|accha|theek|thik|bilkul|zaroor|shayad)\b/i,
    ];

    const hasRomanUrdu = romanUrduPatterns.some((pattern) =>
      pattern.test(text)
    );
    return hasRomanUrdu ? "ur-PK" : "en-US";
  };

  const speak = () => {
    if (!isSupported || isPlaying) return;

    const synth = window.speechSynthesis;

    // Stop any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const language = detectLanguage(text);

    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsPlaying(false);
    };

    synth.speak(utterance);
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={isPlaying ? stop : speak}
      className={cn(
        "h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity",
        isPlaying && "text-red-600 dark:text-red-400",
        className
      )}
      title={isPlaying ? "Stop reading" : "Read aloud"}
    >
      {isPlaying ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </Button>
  );
}
