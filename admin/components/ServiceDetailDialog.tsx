'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, ServiceDetail, PRIORITY_OPTIONS, OfficeCategory } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ServiceDetailDialogProps {
  serviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showActions?: boolean;
  onEdit?: (serviceId: string) => void;
  onDelete?: (serviceId: string) => void;
}

export default function ServiceDetailDialog({
  serviceId,
  open,
  onOpenChange,
  showActions = false,
  onEdit,
  onDelete,
}: ServiceDetailDialogProps) {
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [officeCategories, setOfficeCategories] = useState<OfficeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && serviceId) {
      fetchService(serviceId);
      fetchOfficeCategories();
    } else {
      setService(null);
      setError(null);
    }
  }, [open, serviceId]);

  const fetchOfficeCategories = async () => {
    try {
      const response = await api.getOfficeCategories();
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setOfficeCategories(data);
    } catch (err) {
      console.error('Failed to fetch office categories:', err);
    }
  };

  const fetchService = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getService(id);
      const serviceData = (response as any).data || response;
      setService(serviceData);
    } catch (err: any) {
      setError(err.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    if (!option) return <Badge variant="secondary">Not set</Badge>;
    return <span className={cn('gov-badge', option.color)}>{option.label}</span>;
  };

  const getOfficeCategoryLabel = (categoryId: string) => {
    return officeCategories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {loading ? 'Loading...' : service?.name || 'Service Details'}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && service && (
          <div className="space-y-6 py-4">
            {/* Actions */}
            {showActions && (onEdit || onDelete) && (
              <div className="flex justify-end gap-3">
                {onEdit && (
                  <Button variant="outline" onClick={() => onEdit(service.id)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" onClick={() => onDelete(service.id)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                )}
              </div>
            )}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service ID</label>
                    <p className="text-gray-900 font-mono">{service.serviceId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Slug</label>
                    <p className="text-gray-900 font-mono">{service.slug}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Level</label>
                    <p><Badge variant="outline">Level {service.level}</Badge></p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <p>{getPriorityBadge(service.priority)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Online Enabled</label>
                    <p>
                      {service.isOnlineEnabled ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Validity Period</label>
                    <p className="text-gray-900">{service.validityPeriod || 'Not specified'}</p>
                  </div>
                </div>

                {service.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 mt-1">{service.description}</p>
                  </div>
                )}

                {service.eligibility && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Eligibility</label>
                    <p className="text-gray-900 mt-1">{service.eligibility}</p>
                  </div>
                )}

                {service.onlinePortalUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Online Portal</label>
                    <a
                      href={service.onlinePortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block mt-1"
                    >
                      {service.onlinePortalUrl}
                    </a>
                  </div>
                )}

                {/* Categories */}
                {service.categories && service.categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categories</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {service.categories.map((cat) => (
                        <Badge key={cat.id} variant="default">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Steps */}
            {service.serviceSteps && service.serviceSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Steps ({service.serviceSteps.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {service.serviceSteps.map((step) => (
                      <div
                        key={step.id}
                        className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Step Number */}
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                            {step.step}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-gray-900">{step.stepTitle}</h4>
                                <p className="text-sm text-gray-600 mt-1">{step.stepDescription}</p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {step.isOnline && <Badge variant="success">Online</Badge>}
                                {step.requiresAppointment && <Badge variant="warning">Appointment Required</Badge>}
                              </div>
                            </div>

                            {/* Office Categories */}
                            {step.officeCategoryIds && step.officeCategoryIds.length > 0 && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Office Categories</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {step.officeCategoryIds.map((categoryId) => (
                                    <Badge key={categoryId} variant="outline" className="text-xs">
                                      {getOfficeCategoryLabel(categoryId)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Documents */}
                            {step.documentsRequired.length > 0 && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Documents Required ({step.documentsRequired.length})
                                </label>
                                <div className="space-y-2 mt-2">
                                  {step.documentsRequired.map((doc) => (
                                    <div key={doc.id} className="bg-gray-50 border border-gray-200 rounded p-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="font-medium text-gray-900">{doc.name}</span>
                                          </div>
                                          {doc.nameNepali && (
                                            <p className="text-xs text-gray-600 mt-1 ml-6">{doc.nameNepali}</p>
                                          )}
                                          <div className="flex flex-wrap gap-2 mt-2 ml-6">
                                            <Badge variant={doc.isMandatory ? 'danger' : 'default'} className="text-xs">
                                              {doc.isMandatory ? 'Mandatory' : 'Optional'}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                            {doc.quantity && <Badge variant="outline" className="text-xs">Qty: {doc.quantity}</Badge>}
                                            {doc.format && <Badge variant="outline" className="text-xs">{doc.format}</Badge>}
                                          </div>
                                          {doc.notes && (
                                            <p className="text-xs text-gray-600 mt-2 ml-6">{doc.notes}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Fees */}
                            {step.totalFees.length > 0 && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Fees ({step.totalFees.length})
                                </label>
                                <div className="space-y-2 mt-2">
                                  {step.totalFees.map((fee) => (
                                    <div key={fee.id} className="bg-amber-50 border border-amber-200 rounded p-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="font-medium text-amber-900">{fee.feeTitle}</div>
                                          {fee.feeTitleNepali && (
                                            <div className="text-xs text-amber-700 mt-1">{fee.feeTitleNepali}</div>
                                          )}
                                          <div className="flex items-center gap-2 mt-2">
                                            <span className="text-lg font-bold text-amber-900">
                                              {fee.currency} {fee.feeAmount}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{fee.feeType}</Badge>
                                            {fee.isRefundable && (
                                              <Badge variant="success" className="text-xs">Refundable</Badge>
                                            )}
                                          </div>
                                          {fee.notes && (
                                            <p className="text-xs text-amber-800 mt-2">{fee.notes}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Time */}
                            {step.timeRequired && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Required</label>
                                <p className="text-sm text-gray-700 mt-1">
                                  {step.timeRequired.averageTime} (Min: {step.timeRequired.minimumTime}, Max: {step.timeRequired.maximumTime})
                                </p>
                                {step.timeRequired.remarks && (
                                  <p className="text-xs text-gray-600 mt-1">{step.timeRequired.remarks}</p>
                                )}
                                {step.timeRequired.expeditedAvailable && (
                                  <Badge variant="default" className="text-xs mt-1">Expedited Available</Badge>
                                )}
                              </div>
                            )}

                            {/* Working Hours */}
                            {step.workingHours && step.workingHours.length > 0 && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Working Hours</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                  {step.workingHours.map((wh) => (
                                    <div key={wh.day} className="text-xs bg-gray-50 px-2 py-1 rounded">
                                      <span className="font-medium text-gray-700">{wh.day}:</span>
                                      <span className="text-gray-600 ml-1">{wh.openClose}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Responsible Authorities */}
                            {step.responsibleAuthorities && step.responsibleAuthorities.length > 0 && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Responsible Authorities ({step.responsibleAuthorities.length})
                                </label>
                                <div className="space-y-2 mt-2">
                                  {step.responsibleAuthorities.map((auth) => (
                                    <div key={auth.id} className="bg-blue-50 border border-blue-100 rounded p-2">
                                      <div className="text-sm font-medium text-blue-900">{auth.position}</div>
                                      {auth.positionNepali && (
                                        <div className="text-xs text-blue-700">{auth.positionNepali}</div>
                                      )}
                                      {auth.department && (
                                        <div className="text-xs text-gray-600 mt-1">Dept: {auth.department}</div>
                                      )}
                                      <div className="flex gap-3 mt-1">
                                        {auth.contactNumber && (
                                          <span className="text-xs text-gray-600">📞 {auth.contactNumber}</span>
                                        )}
                                        {auth.email && (
                                          <span className="text-xs text-gray-600">✉️ {auth.email}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Complaint Authorities */}
                            {step.complaintAuthorities && step.complaintAuthorities.length > 0 && (
                              <div className="mt-3">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Complaint Authorities ({step.complaintAuthorities.length})
                                </label>
                                <div className="space-y-2 mt-2">
                                  {step.complaintAuthorities.map((auth) => (
                                    <div key={auth.id} className="bg-red-50 border border-red-100 rounded p-2">
                                      <div className="text-sm font-medium text-red-900">{auth.position}</div>
                                      {auth.positionNepali && (
                                        <div className="text-xs text-red-700">{auth.positionNepali}</div>
                                      )}
                                      {auth.department && (
                                        <div className="text-xs text-gray-600 mt-1">Dept: {auth.department}</div>
                                      )}
                                      <div className="flex gap-3 mt-1">
                                        {auth.contactNumber && (
                                          <span className="text-xs text-gray-600">📞 {auth.contactNumber}</span>
                                        )}
                                        {auth.email && (
                                          <span className="text-xs text-gray-600">✉️ {auth.email}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Procedure */}
            {service.detailedProc && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Procedure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Overview</label>
                    <p className="text-gray-900 mt-1">{service.detailedProc.overview}</p>
                  </div>

                  {service.detailedProc.stepByStepGuide && service.detailedProc.stepByStepGuide.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Step-by-Step Guide</label>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        {service.detailedProc.stepByStepGuide.map((step, i) => (
                          <li key={i} className="text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {service.detailedProc.importantNotes && service.detailedProc.importantNotes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Important Notes</label>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {service.detailedProc.importantNotes.map((note, i) => (
                          <li key={i} className="text-gray-700">{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Child Services Info */}
            {service.children && service.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Child Services ({service.children.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.children.map((child) => (
                      <div key={child.id} className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">{child.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{child.slug}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Level {child.level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            {service.metadata && (
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {service.metadata.version && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version</span>
                      <span>{service.metadata.version}</span>
                    </div>
                  )}
                  {service.metadata.dataSource && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source</span>
                      <span>{service.metadata.dataSource}</span>
                    </div>
                  )}
                  {service.metadata.verifiedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Verified By</span>
                      <span>{service.metadata.verifiedBy}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
