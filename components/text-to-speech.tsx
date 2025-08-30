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
    const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    if (urduPattern.test(text)) return "ur-PK";

    // Roman Urdu
    const romanUrduPatterns = [
      // Common pronouns, verbs, particles
      /\b(aap|ap|tum|tu|hum|main|mein|me|mai|mera|meri|mere|tera|teri|tere|hamara|hamari|hamare|unka|unki|unke|iska|iski|iske|uska|uski|uske|yeh|ye|woh|wo|inka|inki|inke)\b/i,

      // Helping verbs
      /\b(hai|hain|hun|tha|thi|the|raha|rahi|rahe|jata|jati|jate|gaya|gayi|gaye|karta|kartay|karte|kari|karo|karna|karen|karenge|hoga|hogi|hon|hona|hogaya|hogayi)\b/i,

      // Common connectors & particles
      /\b(ka|ki|ke|ko|se|par|mein|mai|aur|or|magar|lekin|agar|phir|jab|jabtak|kyun|kyunki|kab|kahan|kahaan|kaise|kis|kya)\b/i,

      // Daily use expressions
      /\b(suno|suniye|dekho|dekhiye|bolo|boliye|batao|bataye|samjhao|samjhaiye|chalo|rukho|rukiye|chup|jao|ao|aao|chahiye|zaroor|shayad|abhi|kal|aj|aaj|yahan|wahan)\b/i,

      // Positive/negative/confirmation words
      /\b(acha|accha|theek|thik|bilkul|haan|han|ji|nahi|nahin|haanji|jihaan|acha|wah|mashallah|inshallah|subhanallah)\b/i,

      // Family & people words
      /\b(amma|ammi|abba|bhai|behen|beta|beti|dost|ustad|sir|madam|bhaiya|chacha|taya|mamu|khala|phuphi)\b/i,

      // Greetings & politeness
      /\b(salam|salaam|assalamualaikum|walaikum|shukriya|meherbani|jazakallah|dua|khuda|khuda hafiz|allah hafiz|goodbye)\b/i,

      // Common slang/phrases
      /\b(kya scene hai|kya haal hai|mast|mazay|scene|jhakas|bakwass|faltu|ghalat|sahi|acha lagta|mazaydar)\b/i,
    ];

    if (romanUrduPatterns.some((p) => p.test(text))) return "ur-PK";

    const hasRomanUrdu = romanUrduPatterns.some((pattern) =>
      pattern.test(text)
    );
    return hasRomanUrdu ? "ur-PK" : "en-US";
  };

  const pickVoice = (lang: string): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;

    // Exact match first
    let candidates = voices.filter(
      (voice) => voice.lang.toLowerCase() === lang.toLowerCase()
    );

    // If none, fallback to same language prefix (ur, en, etc.)
    if (!candidates.length) {
      candidates = voices.filter((voice) =>
        voice.lang.toLowerCase().startsWith(lang.split("-")[0])
      );
    }

    // Prefer female-sounding voices
    const female = candidates.find((v) =>
      /female|zira|hazel|ava|sara|zira/i.test(v.name)
    );
    if (female) return female;

    // Otherwise fallback to first candidate or English
    return (
      candidates[0] ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0] ||
      null
    );
  };

  const speak = () => {
    if (!isSupported || isPlaying) return;

    const synth = window.speechSynthesis;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const language = detectLanguage(text);

    utterance.lang = language;

    // Adjust speech rate & pitch based on language
    utterance.rate = language.startsWith("ur") ? 0.8 : 0.95;
    utterance.pitch = language.startsWith("ur") ? 1.1 : 1;

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
