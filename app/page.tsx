'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, Store, TrendingUp, Eye, Lightbulb, CheckCircle, Loader2 } from 'lucide-react';
import { AnalysisResult } from './types/analysis';
import { AnalysisService } from './services/analysis.service';

export default function RetailShopAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [mismatchData, setMismatchData] = useState<AnalysisResult['identityMismatch'] | null>(null);

  // Load active shop session on mount
  useEffect(() => {
    const activeId = localStorage.getItem('causis_active_shop_id');
    if (activeId) {
      setShopId(activeId);
    }
  }, []);

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
        const result = await AnalysisService.analyzeShopImage(file, shopId);
        
        if (result.identityMismatch?.isMismatch) {
          setMismatchData(result.identityMismatch);
          setLoading(false);
          return;
        }

        setAnalysis(result);
        
        // Save shopId session if returned
        if (result.shopId) {
          setShopId(result.shopId);
          localStorage.setItem('causis_active_shop_id', result.shopId);
        }
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

  // Clear results but KEEP the shopId for continuity
  const softReset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    // shopId is preserved
  };

  // Clear everything (Start from scratch)
  const hardReset = () => {
    setImage(null);
    setAnalysis(null);
    setShopId('');
    setError(null);
    setMismatchData(null);
    localStorage.removeItem('causis_active_shop_id');
  };

  const handleManualNewShop = (file: File) => {
    hardReset();
    // After clearing, we need to upload the file again as a new session
    setTimeout(() => handleImageUpload(file), 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-white/5 text-white/40 border border-white/10';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-white text-black';
      case 'medium': return 'bg-white/10 text-white/80';
      case 'low': return 'bg-white/5 text-white/40';
      default: return 'bg-white/5 text-white/20';
    }
  };

  if (!image) {
    return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto pt-24 px-6">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-medium backdrop-blur-xl mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v1.0 powered by Gemini
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img 
                  src="/logo.png" 
                  alt="Causis Logo" 
                  className="w-32 h-32 relative z-10 rounded-3xl border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Causis
            </h1>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
              An AI system that infers how real-world environments <span className="text-white/80">function</span>, <span className="text-white/80">fail</span>, and <span className="text-white/80">improve</span> from visual input.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-6">
                {shopId && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">
                      Active Session: Continuing Evolution Analysis
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-2xl hover:bg-white/90 transition-all font-semibold active:scale-[0.98]"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </button>

                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-semibold active:scale-[0.98]"
                  >
                    <Camera className="w-5 h-5" />
                    Open Camera
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
                  <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-200 font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mismatch Modal */}
            {mismatchData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Identity Mismatch Detected</h2>
                    <p className="text-white/40 leading-relaxed font-medium">
                      {mismatchData.reasoning}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <button
                      onClick={() => {
                        const file = (fileInputRef.current?.files?.[0] || cameraInputRef.current?.files?.[0]);
                        if (file) handleManualNewShop(file);
                      }}
                      className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      Start Analysis as New Shop
                    </button>
                    <button
                      onClick={() => {
                        setMismatchData(null);
                        softReset();
                      }}
                      className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                      Retry With Original Shop Image
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8 p-4">
              <div>
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 px-2">Analysis Engine Capabilities</h3>
                <div className="grid gap-6">
                  {[
                    { icon: CheckCircle, title: "Systemic Reasoner", desc: "Maps hidden causal relationships in physical spaces." },
                    { icon: TrendingUp, title: "Temporal Modeling", desc: "Tracks how environments evolve across multiple scans." },
                    { icon: Lightbulb, title: "Leverage Points", desc: "Identifies small changes that yield massive ROI." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                        <item.icon className="w-6 h-6 text-white/60 group-hover:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90">{item.title}</h4>
                        <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <img 
                  src="/logo.png" 
                  alt="Causis" 
                  className="w-full h-full object-cover rounded-lg border border-white/10"
                />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Causis <span className="text-white/40 font-medium">/ Analysis</span></h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={softReset}
                className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-[0.98]"
              >
                Check Progress
              </button>
              <button
                onClick={hardReset}
                className="px-5 py-2 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                New Shop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative group max-w-4xl mx-auto mb-12">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
          <img
            src={image}
            alt="Environment Scan"
            className="relative w-full max-h-[500px] object-cover rounded-[2.5rem] border border-white/10 shadow-2xl mix-blend-lighten"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse" />
              <Loader2 className="w-16 h-16 text-white animate-spin relative z-10" />
            </div>
            <p className="text-2xl font-bold text-white/80">Gemini Reasoner Active</p>
            <p className="text-white/40 mt-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
              Mapping spatial dynamics...
            </p>
          </div>
        ) : error ? (
           <div className="max-w-2xl mx-auto px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4">
             <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
             <p className="text-red-200 font-medium">{error}</p>
           </div>
        ) : analysis ? (
          <div className="space-y-12 pb-24">
            {/* System Understanding */}
            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32" />
              
              <div className="relative flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{analysis.understanding.title}</h2>
                  </div>
                  <p className="text-lg text-white/50 leading-relaxed mb-8">{analysis.understanding.description}</p>
                </div>
                
                <div className="md:w-72">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Core Strengths</h3>
                  <div className="space-y-3">
                    {analysis.understanding.strengths.length > 0 ? (
                      analysis.understanding.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-sm font-medium text-white/70">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {strength}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-sm font-medium text-white/30 italic text-center">
                        No specific core strengths identified in this scan.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Evolution Monitoring */}
            {analysis.changes && analysis.changes.detected && (
              <section className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold">Temporal Evolution</h2>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white/[0.03] border border-white/10 rounded-[2rem] p-8">
                    <p className="text-white/40 leading-relaxed italic">"{analysis.changes.description}"</p>
                  </div>
                  
                  <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                    <div className="bg-green-500/5 border border-green-500/10 rounded-[2rem] p-8">
                      <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Gains
                      </h3>
                      {analysis.changes.improvements.length > 0 ? (
                        <ul className="space-y-3">
                          {analysis.changes.improvements.map((item, idx) => (
                            <li key={idx} className="text-sm text-green-100/70 border-b border-white/5 pb-2 last:border-0">{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-green-100/30 italic">
                          No significant gains or improvements detected in this period.
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-8">
                      <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Regressions
                      </h3>
                      {analysis.changes.regressions.length > 0 ? (
                        <ul className="space-y-3">
                          {analysis.changes.regressions.map((item, idx) => (
                            <li key={idx} className="text-sm text-red-100/70 border-b border-white/5 pb-2 last:border-0">{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-red-100/30 italic">
                          No regressions or negative trends observed.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Friction Points */}
              <section className="space-y-6">
                <h3 className="text-xl font-bold px-2 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400" /> System Friction
                </h3>
                <div className="space-y-4">
                  {analysis.hiddenIssues.map((issue, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 group hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white/90">{issue.issue}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 leading-relaxed font-medium">{issue.impact}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Leverage Actions */}
              <section className="space-y-6">
                <h3 className="text-xl font-bold px-2 flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400" /> Leverage Points
                </h3>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-indigo-100 flex-1 pr-4">{rec.action}</h4>
                        <span className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all ${getPriorityBadge(rec.priority)}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-indigo-100/40 mb-4 font-medium leading-relaxed">{rec.why}</p>
                      <div className="flex gap-4 text-[11px] font-bold text-indigo-400/60 uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-indigo-400/40 rounded-full" /> {rec.cost} cost</span>
                        <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-indigo-400/40 rounded-full" /> {rec.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
