"use client";

import { useState, useEffect, useRef } from "react";
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);

      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
      };

      // Load immediately if voices are ready
      loadVoices();

      // Load when voices change (e.g. Chrome async)
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const detectLanguage = (text: string): string => {
    // Urdu/Arabic script
    const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    if (urduPattern.test(text)) return "ur-PK";

    // Roman Urdu
    const romanUrduPatterns = [
      /\b(aap|ap|hum|main|mein|hai|hain|ka|ki|ke|ko|se|par|or|aur|kya|kaise|kahan|kab|kyun|jo|jis|agar|lekin|phir|abhi|yahan|wahan|yeh|ye|woh|wo|iska|uska|hamara|tumhara|apka)\b/i,
      /\b(batao|bataiye|samjhao|samjhaiye|dekho|dekhiye|suno|suniye|karo|kariye|acha|accha|theek|thik|bilkul|zaroor|shayad)\b/i,
    ];

    const hasRomanUrdu = romanUrduPatterns.some((pattern) =>
      pattern.test(text)
    );
    return hasRomanUrdu ? "ur-PK" : "en-US";
  };

  const pickVoice = (lang: string): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;

    // Try exact match
    let v = voices.find(
      (voice) => voice.lang.toLowerCase() === lang.toLowerCase()
    );

    if (!v) {
      // Fallback: pick first matching language prefix
      v = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(lang.split("-")[0])
      );
    }

    // Last fallback: just pick default English
    if (!v)
      v = voices.find((voice) => voice.lang.startsWith("en")) || voices[0];

    return v || null;
  };

  const speak = () => {
    if (!isSupported || isPlaying) return;

    const synth = window.speechSynthesis;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const language = detectLanguage(text);

    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick consistent voice
    const voice = pickVoice(language);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      utteranceRef.current = null;
    }
  };

  if (!isSupported) return null;

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
