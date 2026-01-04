// ============================================
// FILE: components/services/LocationSetupModal.tsx
// DESCRIPTION: Modal for users to set their permanent and convenient addresses
// ============================================

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocationSelector } from "@/components/shared";
import type { LocationValue } from "@/components/shared/LocationSelector";
import {  type UpdateUserLocationsDto } from "@/lib/api";
import { MapPin, Home, Building2, X, Check, Loader2 } from "lucide-react";

interface LocationSetupModalProps {
  userId: string;
  onComplete: (locations: UpdateUserLocationsDto) => void;
  onSkip?: () => void;
  initialPermanent?: LocationValue;
  initialConvenient?: LocationValue;
}

export function LocationSetupModal({
  onComplete,
  onSkip,
  initialPermanent = {},
  initialConvenient = {},
}: LocationSetupModalProps) {
  const [step, setStep] = useState<"permanent" | "convenient" | "confirm">("permanent");
  const [permanent, setPermanent] = useState<LocationValue>(initialPermanent);
  const [convenient, setConvenient] = useState<LocationValue>(initialConvenient);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const dto: UpdateUserLocationsDto = {
        permanentProvinceId: permanent.provinceId,
        permanentDistrictId: permanent.districtId,
        permanentMunicipalityId: permanent.municipalityId,
        permanentWardId: permanent.wardId,
        convenientProvinceId: convenient.provinceId,
        convenientDistrictId: convenient.districtId,
        convenientMunicipalityId: convenient.municipalityId,
        convenientWardId: convenient.wardId,
      };

      // Save to localStorage for immediate access
      localStorage.setItem("userLocations", JSON.stringify(dto));
      
      // Also store the full location objects for easy access
      localStorage.setItem("userLocationDetails", JSON.stringify({
        permanent,
        convenient,
      }));
      
      // TODO: When auth is implemented, save to database with real user ID
      // For now, using localStorage only
      // await updateUserLocations(userId, dto);
      
      onComplete(dto);
    } catch (err) {
      console.error("Failed to save locations:", err);
      setError("Failed to save locations. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canProceedPermanent = permanent.districtId !== undefined;
  const canProceedConvenient = convenient.districtId !== undefined;
  const canSave = canProceedPermanent && canProceedConvenient;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-crimson to-red-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Set Your Locations</h2>
            <p className="text-red-100 text-sm">
              This helps us show you relevant offices automatically
            </p>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-surface px-6 py-4 border-b border-border">
          <div className="flex items-center justify-center max-w-md mx-auto">
            {["permanent", "convenient", "confirm"].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === s ||
                    (s === "convenient" && step === "confirm") ||
                    (s === "permanent" && (step === "convenient" || step === "confirm"))
                      ? "bg-primary-crimson text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      (s === "permanent" && (step === "convenient" || step === "confirm")) ||
                      (s === "convenient" && step === "confirm")
                        ? "bg-primary-crimson"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3 text-sm font-medium text-foreground">
            {step === "permanent" && "Permanent Address"}
            {step === "convenient" && "Convenient Address"}
            {step === "confirm" && "Confirm & Save"}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Permanent Address Step */}
          {step === "permanent" && (
            <div>
              <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Home className="w-6 h-6 text-primary-blue shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Permanent Address
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    This is used for official documents like citizenship, passport,
                    and other government services that require your permanent address.
                  </p>
                </div>
              </div>

              <LocationSelector
                value={permanent}
                onChange={setPermanent}
                showLabels={true}
                showReset={true}
                required="district"
              />

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => setStep("convenient")}
                  disabled={!canProceedPermanent}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Convenient Address Step */}
          {step === "convenient" && (
            <div>
              <div className="flex items-start gap-3 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <Building2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Convenient Address
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    This is used for general services and local offices near where you
                    currently live or work. Makes it easier to find nearby offices.
                  </p>
                </div>
              </div>

              <LocationSelector
                value={convenient}
                onChange={setConvenient}
                showLabels={true}
                showReset={true}
                required="district"
              />

              <div className="flex justify-between gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("permanent")}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!canProceedConvenient}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === "confirm" && (
            <div>
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Review your addresses before saving
                </p>
              </div>

              {/* Permanent Address Summary */}
              <Card className="mb-4 overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary-blue" />
                    Permanent Address
                  </h4>
                </div>
                <div className="p-4">
                  <LocationSummary location={permanent} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("permanent")}
                    className="mt-2"
                  >
                    Edit
                  </Button>
                </div>
              </Card>

              {/* Convenient Address Summary */}
              <Card className="mb-6 overflow-hidden">
                <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    Convenient Address
                  </h4>
                </div>
                <div className="p-4">
                  <LocationSummary location={convenient} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("convenient")}
                    className="mt-2"
                  >
                    Edit
                  </Button>
                </div>
              </Card>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep("convenient")}>
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className="min-w-32"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Locations
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function LocationSummary({ location }: { location: LocationValue }) {
  const parts = [
    location.ward?.wardNumber && `Ward ${location.ward.wardNumber}`,
    location.municipality?.name,
    location.district?.name,
    location.province?.name,
  ].filter(Boolean);

  if (parts.length === 0) {
    return <p className="text-sm text-foreground-muted">Not set</p>;
  }

  return (
    <div className="space-y-1">
      {parts.map((part, idx) => (
        <p key={idx} className="text-sm text-foreground-secondary">
          {part}
        </p>
      ))}
    </div>
  );
}

export default LocationSetupModal;
