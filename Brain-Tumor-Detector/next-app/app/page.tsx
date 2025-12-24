'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Brain, Scan } from 'lucide-react';

export default function BrainTumorDetector() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tumorDetected, setTumorDetected] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);

    setResultImage(null);
    setTumorDetected(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/segment', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.segmented_image) {
        setResultImage(`data:image/png;base64,${result.segmented_image}`);
        setTumorDetected(true);
      } else {
        throw new Error('No segmented image in response');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setTumorDetected(false);
      setResultImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResultImage(null);
    setTumorDetected(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="inline-block mb-4">
            <Brain className="w-16 h-16 text-indigo-600 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Brain Tumor Detection
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Medical Image Analysis
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Ready</span>
          </div>
        </div>

        {/* Upload Section */}
        {!uploadedImage && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-indigo-100">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-indigo-300 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <Upload className="w-20 h-20 text-indigo-500 group-hover:text-indigo-600 transition-colors group-hover:scale-110 transform duration-300" />
                    <div className="absolute -inset-4 bg-indigo-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <p className="mb-3 text-lg text-gray-700 font-semibold">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">Brain MRI Scan (PNG, JPG, JPEG)</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {uploadedImage && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-indigo-100">
            
            {/* Loading State with Animation */}
            {loading && (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Scan className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="text-2xl font-semibold text-gray-800">Analyzing Brain Scan...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Results - Tumor Detected */}
            {!loading && tumorDetected === true && (
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 rounded-full p-3">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-700">Tumor Detected</h3>
                      <p className="text-green-600">Segmentation analysis complete</p>
                    </div>
                  </div>
                </div>

                {/* Images Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Original Scan
                    </h3>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                      <div className="relative bg-gray-50 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-lg">
                        <img
                          src={uploadedImage}
                          alt="Original brain scan"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Segmented Result
                    </h3>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                      <div className="relative bg-gray-50 rounded-2xl overflow-hidden border-2 border-green-300 shadow-lg">
                        <img
                          src={resultImage}
                          alt="Segmented tumor"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                  <button
                    onClick={handleReset}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  >
                    Analyze New Scan
                  </button>
                  <a
                    href={resultImage}
                    download="tumor_segmentation.png"
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/50"
                  >
                    Download Result
                  </a>
                </div>
              </div>
            )}

            {/* Results - No Tumor Detected */}
            {!loading && tumorDetected === false && (
              <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 rounded-full p-3">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700">No Tumor Detected</h3>
                      <p className="text-blue-600">Analysis did not identify any abnormalities</p>
                    </div>
                  </div>
                </div>

                {/* Single Image Display */}
                <div className="max-w-2xl mx-auto space-y-3">
                  <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Analyzed Scan
                  </h3>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-gray-50 rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg">
                      <img
                        src={uploadedImage}
                        alt="Analyzed brain scan"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleReset}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                  >
                    Analyze Another Scan
                  </button>
                </div>
              </div>
            )}

            {/* Loading State - Image with Scanning Animation */}
            {loading && (
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                  <div className="relative bg-gray-50 rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-lg">
                    <img
                      src={uploadedImage}
                      alt="Processing brain scan"
                      className="w-full h-auto opacity-50"
                    />
                    {/* Scanning Line Animation */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan shadow-lg shadow-indigo-500/50"></div>
                    </div>
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Image</h3>
            <p className="text-gray-600 text-sm">Select a brain MRI scan for analysis</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Scan className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Analysis</h3>
            <p className="text-gray-600 text-sm">Advanced neural network detection</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Results</h3>
            <p className="text-gray-600 text-sm">Instant segmentation and diagnosis</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}