// ============================================
// FILE: components/shared/SearchBar.tsx
// DESCRIPTION: Search input with suggestions
// ============================================

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchServices } from "@/lib/api";
import type { Service } from "@/lib/types";
import { debounce } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

export function SearchBar({
  placeholder = "Search for services... (e.g., citizenship, passport)",
  className,
  size = "default",
  autoFocus = false,
  showSuggestions = true,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchServices(searchQuery);
        setSuggestions(results.slice(0, 5));
      } catch (error) {
        console.error("Search failed:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (showSuggestions) {
      debouncedSearch(value);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (service: Service) => {
    router.push(`/services/${service.slug}`);
    setQuery("");
    setSuggestions([]);
    setIsFocused(false);
  };

  // Clear input
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted",
              size === "lg" ? "w-5 h-5" : "w-4 h-4"
            )}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full border border-border bg-card rounded-xl text-foreground transition-all duration-200",
              "placeholder:text-foreground-muted",
              "focus:border-nepal-blue focus:outline-none focus:ring-2 focus:ring-nepal-blue/20",
              size === "lg"
                ? "h-14 pl-12 pr-12 text-lg"
                : "h-11 pl-10 pr-10 text-base",
              showDropdown && "rounded-b-none border-b-0"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors",
                size === "lg" ? "p-1" : "p-0.5"
              )}
            >
              <X className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border border-t-0 rounded-b-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-nepal-blue" />
              <span className="ml-2 text-sm text-foreground-muted">
                Searching...
              </span>
            </div>
          ) : (
            <ul className="py-2">
              {suggestions.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(service)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-background-secondary transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-sm text-foreground-muted truncate max-w-[300px]">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-foreground-muted" />
                  </button>
                </li>
              ))}
              {suggestions.length > 0 && (
                <li className="border-t border-border mt-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-nepal-blue hover:bg-background-secondary transition-colors"
                  >
                    <span>View all results for "{query}"</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
