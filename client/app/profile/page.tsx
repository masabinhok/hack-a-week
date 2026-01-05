// ============================================
// FILE: app/profile/page.tsx
// DESCRIPTION: User profile management page
// ============================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Save,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/lib/auth";
import { getProvinces, getDistrictsByProvince, getMunicipalitiesByDistrict, getWardsByMunicipality } from "@/lib/api";

interface LocationData {
  provinces: Array<{ id: number; name: string; nameNepali?: string }>;
  districts: Array<{ id: number; name: string; nameNepali?: string }>;
  municipalities: Array<{ id: number; name: string; nameNepali?: string }>;
  wards: Array<{ id: number; wardNumber: number }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";
  
  const { user, isLoading: authLoading, isAuthenticated, logout, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(isSetup);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    nationalId: "",
    permanentProvinceId: 0,
    permanentDistrictId: 0,
    permanentMunicipalityId: 0,
    permanentWardId: 0,
    convenientProvinceId: 0,
    convenientDistrictId: 0,
    convenientMunicipalityId: 0,
    convenientWardId: 0,
  });

  // Location data
  const [permanentLocations, setPermanentLocations] = useState<LocationData>({
    provinces: [],
    districts: [],
    municipalities: [],
    wards: [],
  });
  
  const [convenientLocations, setConvenientLocations] = useState<LocationData>({
    provinces: [],
    districts: [],
    municipalities: [],
    wards: [],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        nationalId: user.nationalId || "",
        permanentProvinceId: user.permanentProvinceId || 0,
        permanentDistrictId: user.permanentDistrictId || 0,
        permanentMunicipalityId: user.permanentMunicipalityId || 0,
        permanentWardId: user.permanentWardId || 0,
        convenientProvinceId: user.convenientProvinceId || 0,
        convenientDistrictId: user.convenientDistrictId || 0,
        convenientMunicipalityId: user.convenientMunicipalityId || 0,
        convenientWardId: user.convenientWardId || 0,
      });

      // Load existing location hierarchy for permanent address
      if (user.permanentProvinceId) {
        loadDistricts(user.permanentProvinceId, "permanent");
        if (user.permanentDistrictId) {
          loadMunicipalities(user.permanentDistrictId, "permanent");
          if (user.permanentMunicipalityId) {
            loadWards(user.permanentMunicipalityId, "permanent");
          }
        }
      }

      // Load existing location hierarchy for convenient address
      if (user.convenientProvinceId) {
        loadDistricts(user.convenientProvinceId, "convenient");
        if (user.convenientDistrictId) {
          loadMunicipalities(user.convenientDistrictId, "convenient");
          if (user.convenientMunicipalityId) {
            loadWards(user.convenientMunicipalityId, "convenient");
          }
        }
      }
    }
  }, [user]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provinces = await getProvinces();
        setPermanentLocations(prev => ({ ...prev, provinces }));
        setConvenientLocations(prev => ({ ...prev, provinces }));
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  const loadDistricts = async (provinceId: number, type: "permanent" | "convenient") => {
    if (!provinceId) return;
    try {
      const districts = await getDistrictsByProvince(provinceId);
      if (type === "permanent") {
        setPermanentLocations(prev => ({ ...prev, districts, municipalities: [], wards: [] }));
      } else {
        setConvenientLocations(prev => ({ ...prev, districts, municipalities: [], wards: [] }));
      }
    } catch (err) {
      console.error("Failed to load districts:", err);
    }
  };

  // Load municipalities when district changes
  const loadMunicipalities = async (districtId: number, type: "permanent" | "convenient") => {
    if (!districtId) return;
    try {
      const municipalities = await getMunicipalitiesByDistrict(districtId);
      if (type === "permanent") {
        setPermanentLocations(prev => ({ ...prev, municipalities, wards: [] }));
      } else {
        setConvenientLocations(prev => ({ ...prev, municipalities, wards: [] }));
      }
    } catch (err) {
      console.error("Failed to load municipalities:", err);
    }
  };

  // Load wards when municipality changes
  const loadWards = async (municipalityId: number, type: "permanent" | "convenient") => {
    if (!municipalityId) return;
    try {
      const wards = await getWardsByMunicipality(municipalityId);
      if (type === "permanent") {
        setPermanentLocations(prev => ({ ...prev, wards }));
      } else {
        setConvenientLocations(prev => ({ ...prev, wards }));
      }
    } catch (err) {
      console.error("Failed to load wards:", err);
    }
  };

  const handleProvinceChange = (provinceId: number, type: "permanent" | "convenient") => {
    if (type === "permanent") {
      setFormData(prev => ({
        ...prev,
        permanentProvinceId: provinceId,
        permanentDistrictId: 0,
        permanentMunicipalityId: 0,
        permanentWardId: 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        convenientProvinceId: provinceId,
        convenientDistrictId: 0,
        convenientMunicipalityId: 0,
        convenientWardId: 0,
      }));
    }
    loadDistricts(provinceId, type);
  };

  const handleDistrictChange = (districtId: number, type: "permanent" | "convenient") => {
    if (type === "permanent") {
      setFormData(prev => ({
        ...prev,
        permanentDistrictId: districtId,
        permanentMunicipalityId: 0,
        permanentWardId: 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        convenientDistrictId: districtId,
        convenientMunicipalityId: 0,
        convenientWardId: 0,
      }));
    }
    loadMunicipalities(districtId, type);
  };

  const handleMunicipalityChange = (municipalityId: number, type: "permanent" | "convenient") => {
    if (type === "permanent") {
      setFormData(prev => ({
        ...prev,
        permanentMunicipalityId: municipalityId,
        permanentWardId: 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        convenientMunicipalityId: municipalityId,
        convenientWardId: 0,
      }));
    }
    loadWards(municipalityId, type);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const updates: {
        fullName?: string;
        email?: string;
        nationalId?: string;
        permanentProvinceId?: number;
        permanentDistrictId?: number;
        permanentMunicipalityId?: number;
        permanentWardId?: number;
        convenientProvinceId?: number;
        convenientDistrictId?: number;
        convenientMunicipalityId?: number;
        convenientWardId?: number;
      } = {};
      
      if (formData.fullName) updates.fullName = formData.fullName;
      if (formData.email) updates.email = formData.email;
      if (formData.nationalId) updates.nationalId = formData.nationalId;
      if (formData.permanentProvinceId) updates.permanentProvinceId = formData.permanentProvinceId;
      if (formData.permanentDistrictId) updates.permanentDistrictId = formData.permanentDistrictId;
      if (formData.permanentMunicipalityId) updates.permanentMunicipalityId = formData.permanentMunicipalityId;
      if (formData.permanentWardId) updates.permanentWardId = formData.permanentWardId;
      if (formData.convenientProvinceId) updates.convenientProvinceId = formData.convenientProvinceId;
      if (formData.convenientDistrictId) updates.convenientDistrictId = formData.convenientDistrictId;
      if (formData.convenientMunicipalityId) updates.convenientMunicipalityId = formData.convenientMunicipalityId;
      if (formData.convenientWardId) updates.convenientWardId = formData.convenientWardId;

      await updateProfile(updates);
      await refreshUser();
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // If this was setup, redirect to my-services
      if (isSetup) {
        setTimeout(() => router.push("/my-services"), 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nepal-blue" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-foreground-secondary hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">My Profile</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Setup Banner */}
        {isSetup && (
          <Card className="bg-nepal-blue/5 border-nepal-blue/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-nepal-blue mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Complete Your Profile</p>
                  <p className="text-sm text-foreground-secondary">
                    Add your details to get personalized service recommendations and save your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Basic Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                {isEditing ? (
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-foreground-secondary">{user.fullName || "Not set"}</p>
                )}
              </div>

              {/* Phone Number (read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                  {user.phoneVerified && (
                    <Badge variant="success" className="text-xs">Verified</Badge>
                  )}
                </label>
                <p className="text-foreground-secondary">{user.phoneNumber}</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email (Optional)
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                ) : (
                  <p className="text-foreground-secondary">{user.email || "Not set"}</p>
                )}
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">National ID (Optional)</label>
                {isEditing ? (
                  <Input
                    value={formData.nationalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                    placeholder="Enter your national ID"
                  />
                ) : (
                  <p className="text-foreground-secondary">{user.nationalId || "Not set"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permanent Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Permanent Address
            </CardTitle>
            <CardDescription>
              Used for citizenship, passport, and other official documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Province</label>
                  <select
                    value={formData.permanentProvinceId}
                    onChange={(e) => handleProvinceChange(Number(e.target.value), "permanent")}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                  >
                    <option value={0}>Select Province</option>
                    {permanentLocations.provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <select
                    value={formData.permanentDistrictId}
                    onChange={(e) => handleDistrictChange(Number(e.target.value), "permanent")}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                    disabled={!formData.permanentProvinceId}
                  >
                    <option value={0}>Select District</option>
                    {permanentLocations.districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Municipality */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Municipality</label>
                  <select
                    value={formData.permanentMunicipalityId}
                    onChange={(e) => handleMunicipalityChange(Number(e.target.value), "permanent")}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                    disabled={!formData.permanentDistrictId}
                  >
                    <option value={0}>Select Municipality</option>
                    {permanentLocations.municipalities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ward</label>
                  <select
                    value={formData.permanentWardId}
                    onChange={(e) => setFormData(prev => ({ ...prev, permanentWardId: Number(e.target.value) }))}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                    disabled={!formData.permanentMunicipalityId}
                  >
                    <option value={0}>Select Ward</option>
                    {permanentLocations.wards.map((w) => (
                      <option key={w.id} value={w.id}>Ward {w.wardNumber}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-foreground-secondary">
                {user.permanentProvinceId ? "Location set" : "Not set"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Convenient Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Convenient Address
            </CardTitle>
            <CardDescription>
              Used for local services and finding nearby offices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Province</label>
                  <select
                    value={formData.convenientProvinceId}
                    onChange={(e) => handleProvinceChange(Number(e.target.value), "convenient")}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                  >
                    <option value={0}>Select Province</option>
                    {convenientLocations.provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <select
                    value={formData.convenientDistrictId}
                    onChange={(e) => handleDistrictChange(Number(e.target.value), "convenient")}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                    disabled={!formData.convenientProvinceId}
                  >
                    <option value={0}>Select District</option>
                    {convenientLocations.districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Municipality */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Municipality</label>
                  <select
                    value={formData.convenientMunicipalityId}
                    onChange={(e) => handleMunicipalityChange(Number(e.target.value), "convenient")}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                    disabled={!formData.convenientDistrictId}
                  >
                    <option value={0}>Select Municipality</option>
                    {convenientLocations.municipalities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ward</label>
                  <select
                    value={formData.convenientWardId}
                    onChange={(e) => setFormData(prev => ({ ...prev, convenientWardId: Number(e.target.value) }))}
                    className="w-full h-11 rounded-lg border border-border bg-input px-3"
                    disabled={!formData.convenientMunicipalityId}
                  >
                    <option value={0}>Select Ward</option>
                    {convenientLocations.wards.map((w) => (
                      <option key={w.id} value={w.id}>Ward {w.wardNumber}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-foreground-secondary">
                {user.convenientProvinceId ? "Location set" : "Not set"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setError("");
                // Reset form data
                if (user) {
                  setFormData({
                    fullName: user.fullName || "",
                    email: user.email || "",
                    nationalId: user.nationalId || "",
                    permanentProvinceId: user.permanentProvinceId || 0,
                    permanentDistrictId: user.permanentDistrictId || 0,
                    permanentMunicipalityId: user.permanentMunicipalityId || 0,
                    permanentWardId: user.permanentWardId || 0,
                    convenientProvinceId: user.convenientProvinceId || 0,
                    convenientDistrictId: user.convenientDistrictId || 0,
                    convenientMunicipalityId: user.convenientMunicipalityId || 0,
                    convenientWardId: user.convenientWardId || 0,
                  });
                }
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        {/* Quick Links */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3">
              <Link href="/my-services">
                <Button variant="outline">My Saved Services</Button>
              </Link>
              <Link href="/services">
                <Button variant="outline">Browse Services</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
