'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocationSelector from '@/components/LocationSelector';
import { 
  ArrowLeft, FileText, DollarSign, Clock, MapPin, Phone, 
  Mail, AlertCircle, CheckCircle, Globe, ChevronDown, ChevronUp,
  Building, Calendar, User, HelpCircle, Flag, Shield
} from 'lucide-react';
import { SubService } from '@/lib/api';

export default function SubServicePage() {
  const params = useParams();
  const { service: serviceSlug, 'sub-service': subServiceSlug } = params;

  const [subService, setSubService] = useState<SubService | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedOfficeType, setSelectedOfficeType] = useState('');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  useEffect(() => {
    const fetchSubService = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/sub-services/${subServiceSlug}`);
        const data = await res.json();
        setSubService(data.data);
        console.log(data.data)
      } catch (error) {
        console.error('Failed to fetch sub-service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubService();
  }, [subServiceSlug, API_BASE_URL]);

  const handleFindOffices = (officeType: string) => {
    setSelectedOfficeType(officeType);
    setShowLocationSelector(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!subService) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-xl">Service not found</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Return to homepage
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Breadcrumb */}
        <section className="bg-white py-4 border-b sticky top-20 z-40">
          <div className="container mx-auto px-4">
            <Link 
              href={`/${serviceSlug}`} 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to service
            </Link>
          </div>
        </section>

        {/* Header Section */}
        <section className="bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${priorityColors[subService.priority]}`}>
                  {subService.priority}
                </span>
                {subService.isOnlineEnabled && (
                  <span className="bg-green-500 bg-opacity-30 text-green-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Online Service Available
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mw">
                {subService.name}
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                {subService.description}
              </p>
              
              {subService.isOnlineEnabled && subService.onlinePortalUrl && (
                <a
                  href={subService.onlinePortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Apply Online
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Overview Section */}
        {subService.detailedProc && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-mw flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  Overview
                </h2>
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {subService.detailedProc.overview}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step-by-Step Process */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 font-mw">
                Step-by-Step Process
              </h2>
              
              <div className="space-y-6">
                {subService.serviceSteps?.map((step, index) => (
                  <div key={step.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    {/* Step Header */}
                    <button
                      onClick={() => setActiveStep(activeStep === index ? null : index)}
                      className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1 text-left">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 font-mw">
                            {step.stepTitle}
                          </h3>
                          <p className="text-gray-600 mb-3">{step.stepDescription}</p>
                          <div className="flex items-center gap-4 flex-wrap text-sm">
                            <span className="inline-flex items-center gap-2 text-gray-700">
                              <Building className="w-4 h-4" />
                              {step.officeType.replace(/_/g, ' ')}
                            </span>
                            {step.requiresAppointment && (
                              <span className="inline-flex items-center gap-2 text-orange-600">
                                <Calendar className="w-4 h-4" />
                                Appointment Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {activeStep === index ? (
                        <ChevronUp className="w-6 h-6 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {/* Step Details */}
                    {activeStep === index && (
                      <div className="border-t border-gray-200">
                        <div className="p-6 space-y-6">
                          {/* Documents Required */}
                          {step.documentsRequired && step.documentsRequired.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Required Documents
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-3">
                                  {step.documentsRequired.map((doc) => (
                                    <div key={doc.id} className="flex items-start gap-3">
                                      <CheckCircle className={`w-5 h-5 mt-0.5 shrink-0 ${
                                        doc.isMandatory ? 'text-red-500' : 'text-green-500'
                                      }`} />
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900">
                                          {doc.name}
                                          {doc.isMandatory && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                              Mandatory
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-600">{doc.nameNepali}</div>
                                        <div className="text-sm text-gray-700 mt-1">
                                          Type: {doc.type} | Quantity: {doc.quantity} | Format: {doc.format}
                                        </div>
                                        {doc.notes && (
                                          <div className="text-sm text-gray-600 mt-1 italic">
                                            Note: {doc.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Fees */}
                          {step.totalFees && step.totalFees.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Fee Structure
                              </h4>
                              <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-gray-200">
                                    <tr>
                                      <th className="text-left p-3 font-semibold text-gray-700">Fee Title</th>
                                      <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                                      <th className="text-right p-3 font-semibold text-gray-700">Amount</th>
                                      <th className="text-center p-3 font-semibold text-gray-700">Refundable</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {step.totalFees.map((fee) => (
                                      <tr key={fee.id} className="border-t border-gray-200">
                                        <td className="p-3">
                                          <div className="font-semibold text-gray-900">{fee.feeTitle}</div>
                                          {fee.feeTitleNepali && (
                                            <div className="text-sm text-gray-600">{fee.feeTitleNepali}</div>
                                          )}
                                        </td>
                                        <td className="p-3">
                                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            {fee.feeType}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-gray-900">
                                          {fee.currency} {fee.feeAmount.toLocaleString()}
                                        </td>
                                        <td className="p-3 text-center">
                                          {fee.isRefundable ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gray-200 font-bold">
                                    <tr>
                                      <td colSpan={2} className="p-3 text-gray-900">Total</td>
                                      <td className="p-3 text-right text-gray-900">
                                        NPR {step.totalFees.reduce((sum, fee) => sum + fee.feeAmount, 0).toLocaleString()}
                                      </td>
                                      <td></td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Processing Time */}
                          {step.timeRequired && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                Processing Time
                              </h4>
                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                  <div className="text-sm text-gray-600 mb-1">Minimum</div>
                                  <div className="text-xl font-bold text-gray-900">{step.timeRequired.minimumTime}</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                  <div className="text-sm text-gray-600 mb-1">Average</div>
                                  <div className="text-xl font-bold text-gray-900">{step.timeRequired.averageTime}</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                  <div className="text-sm text-gray-600 mb-1">Maximum</div>
                                  <div className="text-xl font-bold text-gray-900">{step.timeRequired.maximumTime}</div>
                                </div>
                              </div>
                              {step.timeRequired.expeditedAvailable && (
                                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-yellow-800">
                                    <Flag className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Expedited service available</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Working Hours */}
                          {step.workingHours && step.workingHours.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                Office Hours
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid md:grid-cols-2 gap-3">
                                  {step.workingHours.map((hours) => (
                                    <div key={hours.id} className="flex justify-between items-center">
                                      <span className="font-semibold text-gray-900">{hours.day}</span>
                                      <span className="text-gray-600">{hours.openClose}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Authorities */}
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Responsible Authority */}
                            {step.responsibleAuthorities && step.responsibleAuthorities.length > 0 && (
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <User className="w-5 h-5 text-blue-600" />
                                  Responsible Authority
                                </h4>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                  {step.responsibleAuthorities.map((auth) => (
                                    <div key={auth.id} className="space-y-2">
                                      <div className="font-semibold text-gray-900">{auth.position}</div>
                                      <div className="text-sm text-gray-600">{auth.department}</div>
                                      <div className="text-sm flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4" />
                                        {auth.contactNumber}
                                      </div>
                                      {auth.email && (
                                        <div className="text-sm flex items-center gap-2 text-gray-700">
                                          <Mail className="w-4 h-4" />
                                          {auth.email}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Complaint Authority */}
                            {step.complaintAuthorities && step.complaintAuthorities.length > 0 && (
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  Complaint Authority
                                </h4>
                                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                  {step.complaintAuthorities.map((auth) => (
                                    <div key={auth.id} className="space-y-2">
                                      <div className="font-semibold text-gray-900">{auth.position}</div>
                                      <div className="text-sm text-gray-600">{auth.department}</div>
                                      <div className="text-sm flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4" />
                                        {auth.contactNumber}
                                      </div>
                                      {auth.email && (
                                        <div className="text-sm flex items-center gap-2 text-gray-700">
                                          <Mail className="w-4 h-4" />
                                          {auth.email}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Find Nearby Offices Button */}
                          <div className="pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleFindOffices(step.officeType)}
                              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                            >
                              <MapPin className="w-5 h-5" />
                              Find Nearby {step.officeType.replace(/_/g, ' ')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        {subService.detailedProc && subService.detailedProc.importantNotes && subService.detailedProc.importantNotes.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-mw flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  Important Notes
                </h2>
                <div className="bg-orange-50 rounded-lg border-l-4 border-orange-500 p-6">
                  <ul className="space-y-3">
                    {subService.detailedProc.importantNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></span>
                        <span className="text-gray-700">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {subService.detailedProc && subService.detailedProc.faqs && subService.detailedProc.faqs.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 font-mw flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-purple-600" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {subService.detailedProc.faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                      <button
                        onClick={() => setActiveFaqIndex(activeFaqIndex === index ? null : index)}
                        className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <h3 className="text-lg font-bold text-gray-900 pr-4">{faq.question}</h3>
                        {activeFaqIndex === index ? (
                          <ChevronUp className="w-6 h-6 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400 shrink-0" />
                        )}
                      </button>
                      {activeFaqIndex === index && (
                        <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-200 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Legal References */}
        {subService.detailedProc && subService.detailedProc.legalReferences && subService.detailedProc.legalReferences.length > 0 && (
          <section className="py-12 bg-white border-t">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mw">
                  Legal References
                </h2>
                <div className="space-y-3">
                  {subService.detailedProc.legalReferences.map((ref, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-900">{ref.lawName}</div>
                      <div className="text-sm text-gray-600 mt-1">Section: {ref.section}</div>
                      {ref.url && (
                        <a 
                          href={ref.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                        >
                          View Document →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      {showLocationSelector && (
        <LocationSelector 
          onClose={() => setShowLocationSelector(false)} 
          officeType={selectedOfficeType}
        />
      )}
      
      <Footer />
    </>
  );
}