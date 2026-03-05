import React from 'react';
import { FiStar, FiShare2, FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const SignalCard = ({ signal, view }) => {
  const getDirectionIcon = () => {
    if (signal.direction === 'long') return <FiTrendingUp className="w-5 h-5 text-green-600" />;
    if (signal.direction === 'short') return <FiTrendingDown className="w-5 h-5 text-red-600" />;
    return null;
  };

  const getMagnitudeColor = () => {
    switch(signal.magnitude) {
      case 'strong': return 'border-l-4 border-green-500';
      case 'moderate': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-gray-500';
      default: return '';
    }
  };

  if (view === 'list') {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${getMagnitudeColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getDirectionIcon()}
            <div>
              <h3 className="font-semibold">{signal.source_label}</h3>
              <p className="text-sm text-gray-500">{signal.currency_pair.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="badge badge-info">{signal.source_type}</span>
            <span className={`badge ${signal.confidence >= 0.8 ? 'badge-success' : 'badge-warning'}`}>
              {Math.round(signal.confidence * 100)}% confidence
            </span>
            <div className="flex space-x-2">
              <FiStar className={`w-5 h-5 cursor-pointer ${signal.is_saved ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
              <FiShare2 className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${getMagnitudeColor()}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="badge badge-info">{signal.source_type}</span>
          <h3 className="font-semibold mt-2">{signal.source_label}</h3>
        </div>
        {getDirectionIcon()}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{signal.reasoning}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {signal.currency_pair.map((pair, index) => (
          <span key={index} className="badge badge-success">{pair}</span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            signal.magnitude === 'strong' ? 'bg-green-500' :
            signal.magnitude === 'moderate' ? 'bg-yellow-500' : 'bg-gray-500'
          }`} />
          <span className="capitalize">{signal.magnitude}</span>
        </div>
        <span className="font-medium text-indigo-600">{Math.round(signal.confidence * 100)}% confidence</span>
      </div>

      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
        <FiStar className={`w-5 h-5 cursor-pointer ${signal.is_saved ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
        <FiShare2 className="w-5 h-5 text-gray-400 cursor-pointer" />
        <FiDownload className="w-5 h-5 text-gray-400 cursor-pointer" />
      </div>
    </div>
  );
};

export default SignalCard;