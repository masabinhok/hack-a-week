'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  api,
  Category,
  ServiceDetail,
  CreateServiceData,
  CreateStepData,
  CreateDocumentData,
  CreateFeeData,
  PRIORITY_OPTIONS,
  OfficeCategory,
  DOC_TYPES,
  FEE_TYPES,
  WEEKDAYS,
} from '@/lib/api';
import { slugify, generateServiceId, cn } from '@/lib/utils';

interface ServiceFormProps {
  service?: ServiceDetail;
  parentId?: string;
  isServiceRequest?: boolean;
}

export default function ServiceForm({ service, parentId, isServiceRequest = false }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [officeCategories, setOfficeCategories] = useState<OfficeCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'steps' | 'procedure' | 'metadata'>('basic');

  // Basic Info State
  const [formData, setFormData] = useState<CreateServiceData>({
    serviceId: service?.serviceId || '',
    parentId: service?.parentId || parentId || null,
    name: service?.name || '',
    slug: service?.slug || '',
    description: service?.description || '',
    priority: service?.priority || undefined,
    isOnlineEnabled: service?.isOnlineEnabled || false,
    onlinePortalUrl: service?.onlinePortalUrl || '',
    eligibility: service?.eligibility || '',
    validityPeriod: service?.validityPeriod || '',
    categoryIds: service?.categories?.map((c) => c.id) || [],
    steps: service?.serviceSteps?.map((s) => ({
      step: s.step,
      stepTitle: s.stepTitle,
      stepDescription: s.stepDescription,
      officeCategoryIds: s.officeCategoryIds,
      requiresAppointment: s.requiresAppointment,
      isOnline: s.isOnline,
      onlineFormUrl: s.onlineFormUrl,
      documentsRequired: s.documentsRequired.map((d) => ({
        docId: d.docId,
        name: d.name,
        nameNepali: d.nameNepali,
        type: d.type,
        quantity: d.quantity,
        format: d.format,
        isMandatory: d.isMandatory,
        notes: d.notes,
      })),
      totalFees: s.totalFees.map((f) => ({
        feeId: f.feeId,
        feeTitle: f.feeTitle,
        feeTitleNepali: f.feeTitleNepali,
        feeAmount: f.feeAmount,
        currency: f.currency,
        feeType: f.feeType,
        isRefundable: f.isRefundable,
        notes: f.notes,
      })),
      timeRequired: s.timeRequired ? {
        minimumTime: s.timeRequired.minimumTime,
        maximumTime: s.timeRequired.maximumTime,
        averageTime: s.timeRequired.averageTime,
        remarks: s.timeRequired.remarks,
        expeditedAvailable: s.timeRequired.expeditedAvailable,
      } : undefined,
      workingHours: s.workingHours.map((w) => ({
        day: w.day,
        openClose: w.openClose,
      })),
      responsibleAuthorities: s.responsibleAuthorities.map((a) => ({
        position: a.position,
        positionNepali: a.positionNepali,
        department: a.department,
        contactNumber: a.contactNumber,
        email: a.email,
        isResp: true,
      })),
    })) || [],
    detailedProc: service?.detailedProc ? {
      overview: service.detailedProc.overview,
      overviewNepali: service.detailedProc.overviewNepali,
      stepByStepGuide: service.detailedProc.stepByStepGuide,
      importantNotes: service.detailedProc.importantNotes,
    } : undefined,
    metadata: service?.metadata ? {
      version: service.metadata.version,
      dataSource: service.metadata.dataSource,
      verifiedBy: service.metadata.verifiedBy,
    } : undefined,
  });

  useEffect(() => {
    fetchCategories();
    fetchOfficeCategories();
  }, []);

  // Update formData when service prop changes
  useEffect(() => {
    if (service) {
      setFormData({
        serviceId: service.serviceId || '',
        parentId: service.parentId || parentId || null,
        name: service.name || '',
        slug: service.slug || '',
        description: service.description || '',
        priority: service.priority || undefined,
        isOnlineEnabled: service.isOnlineEnabled || false,
        onlinePortalUrl: service.onlinePortalUrl || '',
        eligibility: service.eligibility || '',
        validityPeriod: service.validityPeriod || '',
        categoryIds: service.categories?.map((c) => c.id) || [],
        steps: service.serviceSteps?.map((s) => ({
          step: s.step,
          stepTitle: s.stepTitle,
          stepDescription: s.stepDescription,
          officeCategoryIds: s.officeCategoryIds,
          requiresAppointment: s.requiresAppointment,
          isOnline: s.isOnline,
          onlineFormUrl: s.onlineFormUrl,
          documentsRequired: s.documentsRequired?.map((d) => ({
            docId: d.docId,
            name: d.name,
            nameNepali: d.nameNepali,
            type: d.type,
            quantity: d.quantity,
            format: d.format,
            isMandatory: d.isMandatory,
            notes: d.notes,
          })) || [],
          totalFees: s.totalFees?.map((f) => ({
            feeId: f.feeId,
            feeTitle: f.feeTitle,
            feeTitleNepali: f.feeTitleNepali,
            feeAmount: f.feeAmount,
            currency: f.currency,
            feeType: f.feeType,
            isRefundable: f.isRefundable,
            notes: f.notes,
          })) || [],
          timeRequired: s.timeRequired ? {
            minimumTime: s.timeRequired.minimumTime,
            maximumTime: s.timeRequired.maximumTime,
            averageTime: s.timeRequired.averageTime,
            remarks: s.timeRequired.remarks,
            expeditedAvailable: s.timeRequired.expeditedAvailable,
          } : undefined,
          workingHours: s.workingHours?.map((w) => ({
            day: w.day,
            openClose: w.openClose,
          })) || [],
          responsibleAuthorities: s.responsibleAuthorities?.map((a) => ({
            position: a.position,
            positionNepali: a.positionNepali,
            department: a.department,
            contactNumber: a.contactNumber,
            email: a.email,
            isResp: true,
          })) || [],
        })) || [],
        detailedProc: service.detailedProc ? {
          overview: service.detailedProc.overview,
          overviewNepali: service.detailedProc.overviewNepali,
          stepByStepGuide: service.detailedProc.stepByStepGuide,
          importantNotes: service.detailedProc.importantNotes,
        } : undefined,
        metadata: service.metadata ? {
          version: service.metadata.version,
          dataSource: service.metadata.dataSource,
          verifiedBy: service.metadata.verifiedBy,
        } : undefined,
      });
    }
  }, [service, parentId]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      // Handle both direct array and wrapped response
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchOfficeCategories = async () => {
    try {
      const response = await api.getOfficeCategories();
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setOfficeCategories(data);
    } catch (error) {
      console.error('Failed to fetch office categories:', error);
      setOfficeCategories([]);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slugify(name),
      serviceId: prev.serviceId || generateServiceId(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isServiceRequest) {
        // Convert full service data to service request
        await api.createServiceRequest({
          serviceName: formData.name,
          serviceDescription: formData.description || undefined,
          categoryId: formData.categoryIds?.[0] || undefined,
          priority: (formData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM',
          justification: `Comprehensive service request with ${formData.steps?.length || 0} steps defined.`,
        });
        router.push('/service-requests');
      } else if (service) {
        await api.updateService(service.id, formData);
        router.push('/services');
      } else {
        await api.createService(formData);
        router.push('/services');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  // Step management
  const addStep = () => {
    const nextStep = (formData.steps?.length || 0) + 1;
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...(prev.steps || []),
        {
          step: nextStep,
          stepTitle: '',
          stepDescription: '',
          officeCategoryIds: [],
          requiresAppointment: false,
          isOnline: false,
          documentsRequired: [],
          totalFees: [],
        },
      ],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 })),
    }));
  };

  const updateStep = (index: number, updates: Partial<CreateStepData>) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps?.map((s, i) => (i === index ? { ...s, ...updates } : s)),
    }));
  };

  // Document management
  const addDocument = (stepIndex: number) => {
    const step = formData.steps?.[stepIndex];
    if (!step) return;
    
    const docCount = step.documentsRequired?.length || 0;
    updateStep(stepIndex, {
      documentsRequired: [
        ...(step.documentsRequired || []),
        {
          docId: `DOC-${docCount + 1}`,
          name: '',
          nameNepali: '',
          type: 'ORIGINAL',
          quantity: 1,
          format: 'A4',
          isMandatory: true,
        },
      ],
    });
  };

  const removeDocument = (stepIndex: number, docIndex: number) => {
    const step = formData.steps?.[stepIndex];
    if (!step) return;
    
    updateStep(stepIndex, {
      documentsRequired: step.documentsRequired?.filter((_, i) => i !== docIndex),
    });
  };

  const updateDocument = (stepIndex: number, docIndex: number, updates: Partial<CreateDocumentData>) => {
    const step = formData.steps?.[stepIndex];
    if (!step) return;
    
    updateStep(stepIndex, {
      documentsRequired: step.documentsRequired?.map((d, i) =>
        i === docIndex ? { ...d, ...updates } : d
      ),
    });
  };

  // Fee management
  const addFee = (stepIndex: number) => {
    const step = formData.steps?.[stepIndex];
    if (!step) return;
    
    const feeCount = step.totalFees?.length || 0;
    updateStep(stepIndex, {
      totalFees: [
        ...(step.totalFees || []),
        {
          feeId: `FEE-${feeCount + 1}`,
          feeTitle: '',
          feeAmount: 0,
          currency: 'NPR',
          feeType: 'GOVERNMENT',
          isRefundable: false,
        },
      ],
    });
  };

  const removeFee = (stepIndex: number, feeIndex: number) => {
    const step = formData.steps?.[stepIndex];
    if (!step) return;
    
    updateStep(stepIndex, {
      totalFees: step.totalFees?.filter((_, i) => i !== feeIndex),
    });
  };

  const updateFee = (stepIndex: number, feeIndex: number, updates: Partial<CreateFeeData>) => {
    const step = formData.steps?.[stepIndex];
    if (!step) return;
    
    updateStep(stepIndex, {
      totalFees: step.totalFees?.map((f, i) =>
        i === feeIndex ? { ...f, ...updates } : f
      ),
    });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'steps', label: 'Steps', icon: '📝' },
    { id: 'procedure', label: 'Procedure', icon: '📖' },
    { id: 'metadata', label: 'Metadata', icon: '⚙️' },
  ] as const;

  return (
    <form onSubmit={handleSubmit}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.id === 'steps' && formData.steps && formData.steps.length > 0 && (
              <Badge variant="secondary" className="ml-1">{formData.steps.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Citizenship Application"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.serviceId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceId: e.target.value }))}
                    placeholder="SVC-CITIZ-A1B2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="citizenship-application"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <Select
                    options={PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
                    value={formData.priority || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as any || undefined }))}
                    placeholder="Select priority"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                  <Textarea
                    value={formData.eligibility || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eligibility: e.target.value }))}
                    placeholder="Who is eligible for this service?"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity Period</label>
                  <Input
                    value={formData.validityPeriod || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, validityPeriod: e.target.value }))}
                    placeholder="e.g., 5 years, Lifetime"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isOnlineEnabled}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isOnlineEnabled: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Online Service Available</span>
                  </label>
                </div>
                {formData.isOnlineEnabled && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online Portal URL</label>
                    <Input
                      value={formData.onlinePortalUrl || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, onlinePortalUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(categories) && categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors',
                      formData.categoryIds?.includes(cat.id)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.categoryIds?.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            categoryIds: [...(prev.categoryIds || []), cat.id],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            categoryIds: prev.categoryIds?.filter((id) => id !== cat.id),
                          }));
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </label>
                ))}
              </div>
              {categories.length === 0 && (
                <p className="text-gray-500 text-sm">No categories available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          {formData.steps && formData.steps.length > 0 ? (
            formData.steps.map((step, stepIndex) => (
            <Card key={stepIndex} className="overflow-visible">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">Step {step.step}</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(stepIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={step.stepTitle}
                      onChange={(e) => updateStep(stepIndex, { stepTitle: e.target.value })}
                      placeholder="e.g., Submit Application Form"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Categories</label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                      {officeCategories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={step.officeCategoryIds?.includes(cat.id) || false}
                            onChange={(e) => {
                              const currentIds = step.officeCategoryIds || [];
                              const newIds = e.target.checked
                                ? [...currentIds, cat.id]
                                : currentIds.filter(id => id !== cat.id);
                              updateStep(stepIndex, { officeCategoryIds: newIds });
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                    {step.officeCategoryIds && step.officeCategoryIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.officeCategoryIds.map(id => {
                          const cat = officeCategories.find(c => c.id === id);
                          return cat ? (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Step Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={step.stepDescription}
                    onChange={(e) => updateStep(stepIndex, { stepDescription: e.target.value })}
                    placeholder="Describe what needs to be done in this step..."
                    rows={2}
                    required
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.requiresAppointment}
                      onChange={(e) => updateStep(stepIndex, { requiresAppointment: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Requires Appointment</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.isOnline}
                      onChange={(e) => updateStep(stepIndex, { isOnline: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Online Step</span>
                  </label>
                </div>

                {step.isOnline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online Form URL</label>
                    <Input
                      value={step.onlineFormUrl || ''}
                      onChange={(e) => updateStep(stepIndex, { onlineFormUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {/* Documents Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Required Documents</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => addDocument(stepIndex)}>
                      + Add Document
                    </Button>
                  </div>
                  {step.documentsRequired && step.documentsRequired.length > 0 ? (
                    <div className="space-y-3">
                      {step.documentsRequired.map((doc, docIndex) => (
                        <div key={docIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input
                              placeholder="Document name"
                              value={doc.name}
                              onChange={(e) => updateDocument(stepIndex, docIndex, { name: e.target.value })}
                            />
                            <Input
                              placeholder="Name (Nepali)"
                              value={doc.nameNepali}
                              onChange={(e) => updateDocument(stepIndex, docIndex, { nameNepali: e.target.value })}
                            />
                            <Select
                              options={DOC_TYPES}
                              value={doc.type}
                              onChange={(e) => updateDocument(stepIndex, docIndex, { type: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={doc.quantity}
                                onChange={(e) => updateDocument(stepIndex, docIndex, { quantity: parseInt(e.target.value) || 1 })}
                                className="w-20"
                              />
                              <label className="flex items-center gap-1 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={doc.isMandatory}
                                  onChange={(e) => updateDocument(stepIndex, docIndex, { isMandatory: e.target.checked })}
                                  className="w-3 h-3"
                                />
                                Required
                              </label>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(stepIndex, docIndex)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No documents added yet</p>
                  )}
                </div>

                {/* Fees Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Fees</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => addFee(stepIndex)}>
                      + Add Fee
                    </Button>
                  </div>
                  {step.totalFees && step.totalFees.length > 0 ? (
                    <div className="space-y-3">
                      {step.totalFees.map((fee, feeIndex) => (
                        <div key={feeIndex} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input
                              placeholder="Fee title"
                              value={fee.feeTitle}
                              onChange={(e) => updateFee(stepIndex, feeIndex, { feeTitle: e.target.value })}
                            />
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={fee.feeAmount}
                              onChange={(e) => updateFee(stepIndex, feeIndex, { feeAmount: parseFloat(e.target.value) || 0 })}
                            />
                            <Select
                              options={FEE_TYPES}
                              value={fee.feeType}
                              onChange={(e) => updateFee(stepIndex, feeIndex, { feeType: e.target.value })}
                            />
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={fee.isRefundable}
                                onChange={(e) => updateFee(stepIndex, feeIndex, { isRefundable: e.target.checked })}
                                className="w-4 h-4"
                              />
                              Refundable
                            </label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFee(stepIndex, feeIndex)}
                            className="text-red-500 hover:text-red-600"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No fees added yet</p>
                  )}
                </div>

                {/* Time Required */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Time Required</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Minimum Time</label>
                      <Input
                        placeholder="e.g., 1 day"
                        value={step.timeRequired?.minimumTime || ''}
                        onChange={(e) => updateStep(stepIndex, {
                          timeRequired: { ...step.timeRequired, minimumTime: e.target.value } as any,
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Average Time</label>
                      <Input
                        placeholder="e.g., 3 days"
                        value={step.timeRequired?.averageTime || ''}
                        onChange={(e) => updateStep(stepIndex, {
                          timeRequired: { ...step.timeRequired, averageTime: e.target.value } as any,
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Maximum Time</label>
                      <Input
                        placeholder="e.g., 7 days"
                        value={step.timeRequired?.maximumTime || ''}
                        onChange={(e) => updateStep(stepIndex, {
                          timeRequired: { ...step.timeRequired, maximumTime: e.target.value } as any,
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No steps added yet. Click the button below to add the first step.</p>
            </div>
          )}

          <Button type="button" variant="outline" onClick={addStep} className="w-full py-6 border-dashed">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Step
          </Button>
        </div>
      )}

      {/* Procedure Tab */}
      {activeTab === 'procedure' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Procedure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
              <Textarea
                value={formData.detailedProc?.overview || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  detailedProc: { 
                    overview: e.target.value,
                    overviewNepali: prev.detailedProc?.overviewNepali || '',
                    stepByStepGuide: prev.detailedProc?.stepByStepGuide || [],
                    importantNotes: prev.detailedProc?.importantNotes || []
                  },
                }))}
                placeholder="Provide an overview of the service procedure..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step-by-Step Guide (one per line)
              </label>
              <Textarea
                value={formData.detailedProc?.stepByStepGuide?.join('\n') || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  detailedProc: {
                    overview: prev.detailedProc?.overview || '',
                    overviewNepali: prev.detailedProc?.overviewNepali || '',
                    stepByStepGuide: e.target.value.split('\n').filter((s) => s.trim()),
                    importantNotes: prev.detailedProc?.importantNotes || []
                  },
                }))}
                placeholder="Step 1: Fill the form&#10;Step 2: Submit documents&#10;..."
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Important Notes (one per line)
              </label>
              <Textarea
                value={formData.detailedProc?.importantNotes?.join('\n') || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  detailedProc: {
                    overview: prev.detailedProc?.overview || '',
                    overviewNepali: prev.detailedProc?.overviewNepali || '',
                    stepByStepGuide: prev.detailedProc?.stepByStepGuide || [],
                    importantNotes: e.target.value.split('\n').filter((s) => s.trim()),
                  },
                }))}
                placeholder="Important note 1&#10;Important note 2&#10;..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <Card>
          <CardHeader>
            <CardTitle>Service Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <Input
                  value={formData.metadata?.version || ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, version: e.target.value },
                  }))}
                  placeholder="e.g., 1.0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                <Input
                  value={formData.metadata?.dataSource || ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, dataSource: e.target.value },
                  }))}
                  placeholder="e.g., Government Portal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verified By</label>
                <Input
                  value={formData.metadata?.verifiedBy || ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, verifiedBy: e.target.value },
                  }))}
                  placeholder="e.g., Admin Name"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>
            {isServiceRequest ? 'Submit Service Request' : service ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </div>
    </form>
  );
}
