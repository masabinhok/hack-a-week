// ============================================
// FILE: app/my-services/page.tsx
// DESCRIPTION: User's saved services and progress tracking
// ============================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  ArrowLeft,
  Loader2,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle,
  Clock,
  BookmarkPlus,
  AlertCircle,
  MoreVertical,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  SavedService,
  getSavedServices,
  updateSavedService,
  removeSavedService,
} from "@/lib/auth";

type StatusFilter = "all" | "saved" | "in-progress" | "completed";

export default function MyServicesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [services, setServices] = useState<SavedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load saved services
  useEffect(() => {
    const loadServices = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await getSavedServices();
        setServices(data);
      } catch (err: any) {
        setError(err.message || "Failed to load saved services");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (
    savedServiceId: string,
    newStatus: "saved" | "in-progress" | "completed"
  ) => {
    try {
      await updateSavedService(savedServiceId, { status: newStatus });
      setServices((prev) =>
        prev.map((s) =>
          s.id === savedServiceId ? { ...s, status: newStatus } : s
        )
      );
      setActiveMenu(null);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleRemove = async (savedServiceId: string) => {
    if (!confirm("Are you sure you want to remove this service from your list?")) {
      return;
    }

    try {
      await removeSavedService(savedServiceId);
      setServices((prev) => prev.filter((s) => s.id !== savedServiceId));
    } catch (err: any) {
      setError(err.message || "Failed to remove service");
    }
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      searchQuery === "" ||
      s.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count by status
  const statusCounts = {
    all: services.length,
    saved: services.filter((s) => s.status === "saved").length,
    "in-progress": services.filter((s) => s.status === "in-progress").length,
    completed: services.filter((s) => s.status === "completed").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bookmark className="h-4 w-4 text-nepal-blue" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in-progress":
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Saved</Badge>;
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nepal-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-foreground-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">
              My Services
            </h1>
          </div>
          <Link href="/services">
            <Button variant="outline" size="sm">
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Browse Services
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Message */}
        {user && (
          <Card className="bg-gradient-to-r from-nepal-blue/5 to-nepal-crimson/5">
            <CardContent className="py-4">
              <p className="text-foreground">
                Welcome back,{" "}
                <span className="font-medium">
                  {user.fullName || user.phoneNumber}
                </span>
                ! Track your government service applications here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg">
            <AlertCircle className="h-5 w-5" />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto hover:bg-error/20 p-1 rounded"
            >
              ×
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search saved services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {(["all", "saved", "in-progress", "completed"] as StatusFilter[]).map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="whitespace-nowrap"
                >
                  {status === "all"
                    ? "All"
                    : status === "in-progress"
                    ? "In Progress"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-1 text-xs opacity-70">
                    ({statusCounts[status]})
                  </span>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-nepal-blue" />
          </div>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {services.length === 0
                  ? "No saved services yet"
                  : "No services match your search"}
              </h3>
              <p className="text-foreground-secondary mb-4">
                {services.length === 0
                  ? "Start by browsing services and saving the ones you need."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {services.length === 0 && (
                <Link href="/services">
                  <Button>
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Browse Services
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((savedService) => (
              <Card key={savedService.id} className="group">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="mt-1">{getStatusIcon(savedService.status)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/services/${savedService.service.slug}`}
                            className="font-medium text-foreground hover:text-nepal-blue"
                          >
                            {savedService.service.name}
                          </Link>
                          {getStatusBadge(savedService.status)}
                        </div>

                        {/* Actions Menu */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === savedService.id
                                  ? null
                                  : savedService.id
                              )
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {activeMenu === savedService.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-border py-1 z-10">
                              {savedService.status !== "in-progress" && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      savedService.id,
                                      "in-progress"
                                    )
                                  }
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2"
                                >
                                  <Clock className="h-4 w-4" />
                                  Mark In Progress
                                </button>
                              )}
                              {savedService.status !== "completed" && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      savedService.id,
                                      "completed"
                                    )
                                  }
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark Completed
                                </button>
                              )}
                              {savedService.status !== "saved" && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(savedService.id, "saved")
                                  }
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-background-secondary flex items-center gap-2"
                                >
                                  <Bookmark className="h-4 w-4" />
                                  Mark Saved
                                </button>
                              )}
                              <hr className="my-1 border-border" />
                              <button
                                onClick={() => handleRemove(savedService.id)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-error/10 text-error flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {savedService.service.description && (
                        <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                          {savedService.service.description}
                        </p>
                      )}

                      {/* Notes */}
                      {savedService.notes && (
                        <div className="mt-2 p-2 bg-background-secondary rounded text-sm">
                          <span className="font-medium">Notes:</span>{" "}
                          {savedService.notes}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-foreground-muted">
                        <span>
                          Saved{" "}
                          {new Date(savedService.createdAt).toLocaleDateString()}
                        </span>
                        {savedService.service.isOnlineEnabled && (
                          <Badge variant="outline" className="text-xs">
                            Online Available
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <Link href={`/services/${savedService.service.slug}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        {savedService.service.isOnlineEnabled && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Apply Online
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-nepal-blue">
                    {statusCounts.saved}
                  </div>
                  <div className="text-sm text-foreground-secondary">Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-500">
                    {statusCounts["in-progress"]}
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    In Progress
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {statusCounts.completed}
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    Completed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
