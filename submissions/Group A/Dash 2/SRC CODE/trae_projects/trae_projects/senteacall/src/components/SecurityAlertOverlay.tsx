
import React from 'react';
import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

interface SecurityAlertOverlayProps {
  isVisible: boolean;
  riskScore: number;
  threats: string[];
  recommendation: string;
  onDismiss: () => void;
}

const SecurityAlertOverlay: React.FC<SecurityAlertOverlayProps> = ({
  isVisible,
  riskScore,
  threats,
  recommendation,
  onDismiss,
}) => {
  if (!isVisible) return null;

  const isHighRisk = riskScore > 80;
  const isMediumRisk = riskScore > 50;

  let bgColor = 'bg-green-100';
  let borderColor = 'border-green-500';
  let icon = <ShieldCheck className="w-12 h-12 text-green-600" />;
  let title = 'Call is Safe';

  if (isHighRisk) {
    bgColor = 'bg-red-100';
    borderColor = 'border-red-500';
    icon = <XCircle className="w-12 h-12 text-red-600" />;
    title = 'High Risk Detected!';
  } else if (isMediumRisk) {
    bgColor = 'bg-yellow-100';
    borderColor = 'border-yellow-500';
    icon = <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    title = 'Potential Threat';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border-4 ${borderColor} ${bgColor} animate-pulse-slow`}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-full shadow-md">
            {icon}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${isHighRisk ? 'bg-red-600' : isMediumRisk ? 'bg-yellow-500' : 'bg-green-500'}`} 
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-gray-700">Risk Score: {riskScore}/100</span>

          {threats.length > 0 && (
            <div className="w-full bg-white bg-opacity-60 p-3 rounded-lg">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Detected Threats:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {threats.map((threat, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-bold text-white bg-gray-800 rounded-full">
                    {threat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-white rounded-lg shadow-inner w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Action Required</h3>
            <p className="text-gray-700">{recommendation}</p>
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-3 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
          >
            Acknowledge & Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlertOverlay;
