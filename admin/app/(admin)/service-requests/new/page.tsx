'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { api, Category, PRIORITY_OPTIONS } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function NewServiceRequestPage() {
  const router = useRouter();
  const { isOfficeAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDescription: '',
    categoryId: '',
    priority: '',
    justification: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    } else if (formData.serviceName.length < 3) {
      newErrors.serviceName = 'Service name must be at least 3 characters';
    } else if (formData.serviceName.length > 200) {
      newErrors.serviceName = 'Service name must be less than 200 characters';
    }

    if (formData.serviceDescription && formData.serviceDescription.length > 2000) {
      newErrors.serviceDescription = 'Description must be less than 2000 characters';
    }

    if (formData.justification && formData.justification.length > 1000) {
      newErrors.justification = 'Justification must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.createServiceRequest({
        serviceName: formData.serviceName.trim(),
        serviceDescription: formData.serviceDescription.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        priority: (formData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || undefined,
        justification: formData.justification.trim() || undefined,
      });
      router.push('/service-requests');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Redirect non-office admins
  if (!isOfficeAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">Only office admins can request new services.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Request New Service"
        description="Submit a request for a new service to be added to the system"
      />

      <div className="p-8 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter the name of the service"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className={errors.serviceName ? 'border-red-500' : ''}
                />
                {errors.serviceName && (
                  <p className="mt-1 text-sm text-red-500">{errors.serviceName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the service and what it provides to citizens"
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                  rows={4}
                  className={errors.serviceDescription ? 'border-red-500' : ''}
                />
                {errors.serviceDescription && (
                  <p className="mt-1 text-sm text-red-500">{errors.serviceDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested Category
                </label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  placeholder="Select a category (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  options={PRIORITY_OPTIONS}
                  placeholder="Select priority (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justification
                </label>
                <Textarea
                  placeholder="Explain why this service should be added (helps with approval)"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={3}
                  className={errors.justification ? 'border-red-500' : ''}
                />
                {errors.justification && (
                  <p className="mt-1 text-sm text-red-500">{errors.justification}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Provide context about why this service is needed and how many citizens it will help.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
