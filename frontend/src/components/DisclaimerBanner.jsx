import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DisclaimerBanner = () => {
    return (
        <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 text-center">
            <div className="flex items-center justify-center text-xs text-gray-600 space-x-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                <span className="font-medium">
                    Demo System — Verifies official issuance only. Does not assess content accuracy, intent, or legality.
                </span>
            </div>
        </div>
    );
};

export default DisclaimerBanner;
