// ============================================
// FILE: components/services/StepTimeline.tsx
// DESCRIPTION: Step-by-step timeline component for service guides
// ============================================

"use client";

import { useState } from "react";
import {
  Check,
  FileText,
  DollarSign,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceStep, StepDocument, StepFee, StepTime, StepAuthority } from "@/lib/types";
import { formatNPR } from "@/lib/utils";

interface StepTimelineProps {
  steps: ServiceStep[];
  className?: string;
}

export function StepTimeline({ steps, className = "" }: StepTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>(
    steps.length > 0 ? [steps[0].id] : []
  );

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const expandAll = () => {
    setExpandedSteps(steps.map((s) => s.id));
  };

  const collapseAll = () => {
    setExpandedSteps([]);
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-2xl">
        <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
        <p className="text-foreground-secondary">
          No steps information available for this service yet.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={expandAll}>
          <ChevronDown className="w-4 h-4 mr-1" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          <ChevronUp className="w-4 h-4 mr-1" />
          Collapse All
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className="relative pl-16 animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                {/* Step Number Circle */}
                <div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                    isExpanded
                      ? "bg-primary-crimson text-white"
                      : "bg-surface border-2 border-border text-foreground-secondary"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Step Card */}
                <Card
                  className={`overflow-hidden transition-all ${
                    isExpanded ? "ring-2 ring-primary-crimson/20" : ""
                  }`}
                >
                  {/* Step Header - Always visible */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full text-left p-6 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {step.stepTitle}
                        </h3>
                        {step.stepTitleNepali && (
                          <p className="text-sm text-foreground-muted nepali-text mb-2">
                            {step.stepTitleNepali}
                          </p>
                        )}
                        {!isExpanded && step.stepDescription && (
                          <p className="text-sm text-foreground-secondary line-clamp-2">
                            {step.stepDescription}
                          </p>
                        )}

                        {/* Quick badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {step.documentsRequired && step.documentsRequired.length > 0 && (
                            <Badge key="docs" variant="secondary" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {step.documentsRequired.length} documents
                            </Badge>
                          )}
                          {step.totalFees && step.totalFees.length > 0 && (
                            <Badge key="fees" variant="secondary" className="text-xs">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {step.totalFees.length} fees
                            </Badge>
                          )}
                          {step.timeRequired && (
                            <Badge key="time" variant="secondary" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {step.timeRequired.averageTime}
                            </Badge>
                          )}
                          {step.responsibleAuthorities && step.responsibleAuthorities.length > 0 && (
                            <Badge key="authority" variant="secondary" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {step.responsibleAuthorities[0].position}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-foreground-muted shrink-0 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border p-6 bg-surface">
                      {/* Description */}
                      {step.stepDescription && (
                        <div key="description" className="mb-6">
                          <p className="text-foreground-secondary leading-relaxed">
                            {step.stepDescription}
                          </p>
                          {step.stepDescriptionNepali && (
                            <p className="text-sm text-foreground-muted nepali-text mt-2">
                              {step.stepDescriptionNepali}
                            </p>
                          )}
                        </div>
                      )}

                      <div key="grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Required Documents */}
                        {step.documentsRequired && step.documentsRequired.length > 0 && (
                          <DocumentsList key="documents" documents={step.documentsRequired} />
                        )}

                        {/* Fees */}
                        {step.totalFees && step.totalFees.length > 0 && (
                          <FeesList key="fees" fees={step.totalFees} />
                        )}
                      </div>

                      {/* Time Estimate */}
                      {step.timeRequired && <TimeInfo key="time-info" time={step.timeRequired} />}

                      {/* Authority */}
                      {step.responsibleAuthorities && step.responsibleAuthorities.length > 0 && (
                        <AuthorityInfo key="authority-info" authority={step.responsibleAuthorities[0]} />
                      )}

                      {/* Notes */}
                      {step.timeRequired?.remarks && (
                        <div key="notes" className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800 mb-1">
                                Important Note
                              </p>
                              <p className="text-sm text-amber-700">
                                {step.timeRequired.remarks}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        {/* Completion marker */}
        <div className="relative pl-16 mt-6">
          <div className="absolute left-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
            <Check className="w-6 h-6" />
          </div>
          <div className="py-4">
            <p className="text-lg font-semibold text-green-600">
              Service Complete!
            </p>
            <p className="text-sm text-foreground-secondary">
              Follow all steps above to complete your application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function DocumentsList({ documents }: { documents: StepDocument[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary-blue" />
        Required Documents
      </h4>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-start gap-2 p-3 rounded-lg bg-background"
          >
            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {doc.name}
              </p>
              {doc.nameNepali && (
                <p className="text-xs text-foreground-muted nepali-text">
                  {doc.nameNepali}
                </p>
              )}
              {doc.notes && (
                <p className="text-xs text-foreground-secondary mt-1">
                  {doc.notes}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {doc.type === 'ORIGINAL' && (
                  <Badge key="type" variant="outline" className="text-xs">
                    Original Required
                  </Badge>
                )}
                {doc.quantity > 1 && (
                  <Badge key="quantity" variant="outline" className="text-xs">
                    {doc.quantity} copies
                  </Badge>
                )}
                {!doc.isMandatory && (
                  <Badge key="optional" variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeesList({ fees }: { fees: StepFee[] }) {
  const totalFee = fees.reduce((sum, fee) => sum + (fee.feeAmount || 0), 0);

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-primary-crimson" />
        Fees
      </h4>
      <div className="space-y-2">
        {fees.map((fee) => (
          <div
            key={fee.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {fee.feeTitle}
              </p>
              {fee.feeTitleNepali && (
                <p className="text-xs text-foreground-muted nepali-text">
                  {fee.feeTitleNepali}
                </p>
              )}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatNPR(fee.feeAmount)}
            </span>
          </div>
        ))}

        {fees.length > 1 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary-blue text-white">
            <span className="font-medium">Total</span>
            <span className="font-bold">{formatNPR(totalFee)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeInfo({ time }: { time: StepTime }) {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Time Estimate
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {time.averageTime && (
          <div key="average">
            <p className="text-xs text-blue-600">Average Duration</p>
            <p className="text-sm font-medium text-blue-900">
              {time.averageTime}
            </p>
          </div>
        )}
        {time.minimumTime && (
          <div key="minimum">
            <p className="text-xs text-blue-600">Minimum</p>
            <p className="text-sm font-medium text-blue-900">
              {time.minimumTime}
            </p>
          </div>
        )}
        {time.maximumTime && (
          <div key="maximum">
            <p className="text-xs text-blue-600">Maximum</p>
            <p className="text-sm font-medium text-blue-900">
              {time.maximumTime}
            </p>
          </div>
        )}
        {time.remarks && (
          <div key="remarks" className="col-span-2 md:col-span-4">
            <p className="text-xs text-blue-600">Note</p>
            <p className="text-sm text-blue-800">{time.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthorityInfo({
  authority,
}: {
  authority: StepAuthority;
}) {
  return (
    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Responsible Authority
      </h4>
      <p className="text-sm font-medium text-purple-900">{authority.position}</p>
      {authority.positionNepali && (
        <p className="text-xs text-purple-700 nepali-text">
          {authority.positionNepali}
        </p>
      )}
      <p className="text-xs text-purple-600 mt-1">{authority.department}</p>
      {authority.departmentNepali && (
        <p className="text-xs text-purple-700 nepali-text">
          {authority.departmentNepali}
        </p>
      )}
    </div>
  );
}

export default StepTimeline;
