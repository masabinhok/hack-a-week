// ============================================
// FILE: components/SaveServiceButton.tsx
// DESCRIPTION: Button to save/unsave a service to user's list
// ============================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSavedServices,
  saveService,
  removeSavedService,
  SavedService,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

interface SaveServiceButtonProps {
  serviceId: string;
  serviceName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export default function SaveServiceButton({
  serviceId,
  serviceName,
  variant = "outline",
  size = "default",
  showText = true,
  className,
}: SaveServiceButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [savedService, setSavedService] = useState<SavedService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if service is already saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      try {
        const savedServices = await getSavedServices();
        const found = savedServices.find((s) => s.serviceId === serviceId);
        setSavedService(found || null);
      } catch (err) {
        console.error("Failed to check saved status:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkSavedStatus();
  }, [isAuthenticated, serviceId]);

  const handleClick = async () => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/login?redirect=/services/${serviceName || serviceId}`);
      return;
    }

    setIsLoading(true);

    try {
      if (savedService) {
        // Unsave
        await removeSavedService(savedService.id);
        setSavedService(null);
      } else {
        // Save
        const saved = await saveService(serviceId);
        setSavedService(saved);
      }
    } catch (err: any) {
      console.error("Failed to save/unsave service:", err);
      // Could show a toast here
    } finally {
      setIsLoading(false);
    }
  };

  const isSaved = !!savedService;

  return (
    <Button
      variant={isSaved ? "secondary" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isChecking}
      className={cn(
        isSaved && "bg-nepal-blue/10 text-nepal-blue hover:bg-nepal-blue/20",
        className
      )}
    >
      {isLoading || isChecking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className={size === "sm" ? "ml-1" : "ml-2"}>
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}
