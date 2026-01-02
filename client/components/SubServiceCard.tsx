import Link from 'next/link';
import { ArrowRight, Globe, Clock } from 'lucide-react';
import { SubService } from '@/lib/api';

interface SubServiceCardProps {
  subService: SubService;
  serviceSlug: string;
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function SubServiceCard({ subService, serviceSlug }: SubServiceCardProps) {
  return (
    <Link href={`/${serviceSlug}/${subService.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-100 hover:border-blue-300 group cursor-pointer">
        {/* Header with Priority Badge */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-900 font-mw group-hover:text-blue-600 transition-colors flex-1 pr-2">
            {subService.name}
          </h4>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${priorityColors[subService.priority]}`}>
            {subService.priority}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {subService.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {subService.isOnlineEnabled && (
            <div className="flex items-center text-green-600 text-sm">
              <Globe className="w-4 h-4 mr-2" />
              <span className="font-medium">Online service available</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>View process</span>
          </div>
          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            <span>Details</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
