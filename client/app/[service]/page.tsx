import { getServiceBySlug } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubServiceCard from '@/components/SubServiceCard';
import { ArrowLeft, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ServicePageProps {
  params: Promise<{
    service: string;
  }>;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { service: slug } = await params;
  
  let service;
  try {
    service = await getServiceBySlug(slug);
  } catch (error) {
    notFound();
  }

  if (!service) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="bg-gray-100 py-4 border-b">
          <div className="container mx-auto px-4">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all services
            </Link>
          </div>
        </section>

        {/* Service Header */}
        <section className="bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-block bg-blue-700 bg-opacity-50 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {service.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 font-mw">
                {service.name}
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Eligibility */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <div className="flex items-start">
                    <Info className="w-6 h-6 text-blue-600 mr-3 mt-1 shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 font-mw">Eligibility</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {service.eligibility}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                {service.validityPeriod && (
                  <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                    <div className="flex items-start">
                      <AlertCircle className="w-6 h-6 text-green-600 mr-3 mt-1 shrink-0" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 font-mw">Validity Period</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {service.validityPeriod}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Services */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-mw">
                Available Sub-Services
              </h2>
              <p className="text-gray-600">
                Choose the specific service you need to view detailed procedures and requirements
              </p>
              <div className="w-20 h-1 bg-blue-600 mt-4"></div>
            </div>

            {service.subServices && service.subServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.subServices.map((subService) => (
                  <SubServiceCard 
                    key={subService.id} 
                    subService={subService} 
                    serviceSlug={service.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No sub-services available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-white border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-mw">
              Need More Information?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Select a sub-service above to view complete step-by-step procedures, 
              required documents, fees, processing time, and office locations.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}