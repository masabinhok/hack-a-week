import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Service } from '@/lib/api';

interface ServiceCardProps {
  service: Service;
}

const categoryIcons: Record<string, string> = {
  'Citizenship': '🆔',
  'Travel & Immigration': '✈️',
  'Transportation': '🚗',
  'Business': '💼',
  'Education': '📚',
  'Land & Property': '🏠',
  'Social Welfare': '🤝',
  'Health': '🏥',
  'Agriculture': '🌾',
  'Legal': '⚖️',
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const icon = categoryIcons[service.categories?.[0]?.name || ''] || '📋';

  return (
    <Link href={`/${service.slug}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 h-full border border-gray-100 hover:border-blue-300 group cursor-pointer">
        {/* Icon and Category */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl">{icon}</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {service.categories?.[0]?.name || 'Service'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 font-mw group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-500 text-sm">
            <FileText className="w-4 h-4 mr-2" />
            <span>{service.childrenCount || 0} sub-services</span>
          </div>
          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
