"use client"
import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Leaf, Calendar, Sparkles } from 'lucide-react';

// Add custom CSS for animations
const styles = `
  @keyframes scan-vertical {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-scan-vertical {
    animation: scan-vertical 2s linear infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .animate-spin-reverse {
    animation: spin-reverse 2s linear infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
    opacity: 0;
  }
  
  .bg-grid-pattern {
    background-image: 
      linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;

export default function FruitAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality) => {
    const qualityLower = quality?.toLowerCase() || '';
    if (qualityLower.includes('excellent') || qualityLower.includes('fresh')) return 'green';
    if (qualityLower.includes('good') || qualityLower.includes('moderate')) return 'yellow';
    return 'red';
  };

  const getHealthColor = (health) => {
    const healthLower = health?.toLowerCase() || '';
    if (healthLower.includes('healthy') && !healthLower.includes('not')) return 'green';
    if (healthLower.includes('moderate')) return 'yellow';
    return 'red';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <style>{styles}</style>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12 text-green-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Fruit Quality Analyzer
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Upload a fruit image to get instant quality analysis</p>
        </div>

        {/* Upload Section */}
        {!result && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div
              className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Drag & drop your fruit image here
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                />
                <span className="px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors inline-block font-medium">
                  Choose File
                </span>
              </label>
              <p className="text-sm text-gray-400 mt-4">Supports: JPEG, JPG, PNG (Max 5MB)</p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {preview && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Preview</h3>
                <div className="flex flex-col items-center gap-6">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-md w-full h-auto rounded-xl shadow-lg"
                  />
                  <button
                    onClick={analyzeImage}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Fruit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Analyzing Your Fruit...</h3>
            
            <div className="relative max-w-2xl mx-auto">
              {/* Image with overlay effects */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={preview}
                  alt="Analyzing"
                  className="w-full h-auto rounded-xl"
                />
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-vertical"></div>
                </div>
                
                {/* Grid overlay with pulse */}
                <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-pulse-slow"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-green-500 animate-pulse"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-green-500 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-green-500 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-green-500 animate-pulse"></div>
                
                {/* Circular scan effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-green-500 border-t-transparent rounded-full animate-spin-slow"></div>
                  <div className="absolute w-24 h-24 border-4 border-emerald-400 border-b-transparent rounded-full animate-spin-reverse"></div>
                </div>
                
                {/* Scanning dots */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-teal-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                
                {/* Semi-transparent overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 via-transparent to-emerald-500/20"></div>
              </div>
              
              {/* Analysis steps */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-gray-700 animate-fade-in">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Detecting fruit type...</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span className="text-sm">Analyzing freshness and quality...</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 animate-fade-in" style={{animationDelay: '1s'}}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-sm">Evaluating health benefits...</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 animate-fade-in" style={{animationDelay: '1.5s'}}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                  <span className="text-sm">Generating comprehensive report...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className={`p-6 bg-gradient-to-r ${
                getQualityColor(result.quality_status) === 'green'
                  ? 'from-green-500 to-emerald-500'
                  : getQualityColor(result.quality_status) === 'yellow'
                  ? 'from-yellow-500 to-orange-500'
                  : 'from-red-500 to-pink-500'
              }`}>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  Analysis Complete!
                </h2>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <img
                      src={preview}
                      alt="Analyzed fruit"
                      className="w-full h-auto rounded-xl shadow-lg"
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{result.fruit_name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${
                        getQualityColor(result.freshness) === 'green'
                          ? 'bg-green-100 border-2 border-green-300'
                          : getQualityColor(result.freshness) === 'yellow'
                          ? 'bg-yellow-100 border-2 border-yellow-300'
                          : 'bg-red-100 border-2 border-red-300'
                      }`}>
                        <p className="text-sm font-medium text-gray-600 mb-1">Freshness</p>
                        <p className={`text-lg font-bold ${
                          getQualityColor(result.freshness) === 'green'
                            ? 'text-green-700'
                            : getQualityColor(result.freshness) === 'yellow'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}>
                          {result.freshness}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl ${
                        getQualityColor(result.quality_status) === 'green'
                          ? 'bg-green-100 border-2 border-green-300'
                          : getQualityColor(result.quality_status) === 'yellow'
                          ? 'bg-yellow-100 border-2 border-yellow-300'
                          : 'bg-red-100 border-2 border-red-300'
                      }`}>
                        <p className="text-sm font-medium text-gray-600 mb-1">Quality</p>
                        <p className={`text-lg font-bold ${
                          getQualityColor(result.quality_status) === 'green'
                            ? 'text-green-700'
                            : getQualityColor(result.quality_status) === 'yellow'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}>
                          {result.quality_status}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                      result.consumable
                        ? 'bg-green-100 border-2 border-green-300'
                        : 'bg-red-100 border-2 border-red-300'
                    }`}>
                      {result.consumable ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-600">Consumable</p>
                        <p className={`text-lg font-bold ${
                          result.consumable ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.consumable ? 'Safe to Eat' : 'Not Recommended'}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl ${
                      getHealthColor(result.healthy_for_consumption) === 'green'
                        ? 'bg-green-100 border-2 border-green-300'
                        : getHealthColor(result.healthy_for_consumption) === 'yellow'
                        ? 'bg-yellow-100 border-2 border-yellow-300'
                        : 'bg-red-100 border-2 border-red-300'
                    }`}>
                      <p className="text-sm font-medium text-gray-600 mb-1">Health Status</p>
                      <p className={`text-lg font-bold ${
                        getHealthColor(result.healthy_for_consumption) === 'green'
                          ? 'text-green-700'
                          : getHealthColor(result.healthy_for_consumption) === 'yellow'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}>
                        {result.healthy_for_consumption}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Peak Season</p>
                        <p className="text-lg font-bold text-blue-700">{result.season}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-600" />
                    Health Benefits
                  </h4>
                  <ul className="space-y-2">
                    {result.health_benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.additional_notes && (
                  <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Additional Notes</p>
                      <p className="text-gray-700">{result.additional_notes}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setPreview(null);
                  }}
                  className="mt-8 w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Analyze Another Fruit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}