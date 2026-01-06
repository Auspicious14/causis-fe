'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Store, TrendingUp, Eye, Lightbulb, CheckCircle, Loader2 } from 'lucide-react';

interface AnalysisResult {
  understanding: {
    title: string;
    description: string;
    strengths: string[];
  };
  hiddenIssues: Array<{
    issue: string;
    impact: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  futureOutcome: {
    withoutChanges: string;
    withChanges: string;
  };
  recommendations: Array<{
    action: string;
    why: string;
    priority: 'low' | 'medium' | 'high';
    cost: string;
    timeframe: string;
  }>;
}

// Real API call to NestJS backend
const analyzeShopImage = async (imageFile: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:3000/analysis/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Analysis failed');
  }

  return response.json();
};

export default function RetailShopAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setAnalysis(null);
    
    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      
      // Start analysis
      setLoading(true);
      try {
        // Pass the actual File object to the API
        const result = await analyzeShopImage(file);
        setAnalysis(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Analysis failed. Please try again.');
        // Don't clear image on error so user can retry or see what they uploaded
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Shop Analyzer
            </h1>
            <p className="text-gray-600">
              Upload a photo of your retail shop to get AI-powered insights and recommendations
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                <Upload className="w-5 h-5" />
                Upload Photo
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Deep understanding of your shop's current state
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Hidden issues affecting your sales
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Projected business outcomes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Actionable recommendations with ROI estimates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Shop Analysis</h1>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Analyze Another
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Image Preview */}
        <div className="mb-8">
          <img
            src={image}
            alt="Shop"
            className="w-full max-h-96 object-contain rounded-xl shadow-lg bg-white"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Analyzing your shop...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        ) : error ? (
           <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
             <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
             <p className="text-sm text-red-800">{error}</p>
           </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Understanding Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{analysis.understanding.title}</h2>
                  <p className="text-gray-600 mt-2">{analysis.understanding.description}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Current Strengths:</p>
                <ul className="space-y-1">
                  {analysis.understanding.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hidden Issues */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Hidden Issues</h2>
              </div>

              <div className="space-y-4">
                {analysis.hiddenIssues.map((issue, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{issue.issue}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{issue.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Outcome */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Future Outlook</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                  <p className="text-xs font-semibold text-red-700 uppercase mb-2">Without Changes</p>
                  <p className="text-sm text-gray-700">{analysis.futureOutcome.withoutChanges}</p>
                </div>
                <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">With Changes</p>
                  <p className="text-sm text-gray-700">{analysis.futureOutcome.withChanges}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recommended Actions</h2>
              </div>

              <div className="space-y-4">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 flex-1">{rec.action}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.why}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>💰 Cost: <span className="font-medium text-gray-700">{rec.cost}</span></span>
                      <span>⏱️ Timeframe: <span className="font-medium text-gray-700">{rec.timeframe}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
