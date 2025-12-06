'use client';

import { useState } from 'react';
import { Shield, Mail, Link2, AlertTriangle, CheckCircle, Loader2, Info, Upload, FileText } from 'lucide-react';

interface DetectionResult {
  spam: boolean;
  description: string;
  error?: string;
}

export default function SpamPhishingDetector() {
  const [activeTab, setActiveTab] = useState<'email' | 'url'>('email');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  
  // Email form state
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [emailSender, setEmailSender] = useState<string>('');
  
  // URL form state
  const [url, setUrl] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      alert('Please upload a valid .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setEmailBody(content);
        setEmailSubject('not mentioned');
        setEmailSender('');
      }
    };
    reader.readAsText(file);
  };

  const handleEmailCheck = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Please fill in subject and body fields');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          subject: emailSubject,
          body: emailBody,
          sender: emailSender || undefined,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error connecting to API: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlCheck = async () => {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'url', url }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error connecting to API: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmailSubject('');
    setEmailBody('');
    setEmailSender('');
    setUrl('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 mr-4" />
            <h1 className="text-5xl font-bold">CyberGuard AI</h1>
          </div>
          <p className="text-xl text-center text-indigo-100 max-w-3xl mx-auto">
            Protect yourself from spam emails and phishing URLs with advanced AI-powered detection
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Email Spam</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Spam emails are unsolicited messages sent in bulk, often containing scams, malware, 
                  or attempts to steal personal information. They waste time and pose security risks.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Link2 className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Phishing URLs</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Phishing URLs mimic legitimate websites to trick you into revealing passwords, 
                  credit card details, or other sensitive data. Always verify links before clicking!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Detection Interface */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('email'); resetForm(); }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'email'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-5 h-5 inline mr-2" />
              Check Email
            </button>
            <button
              onClick={() => { setActiveTab('url'); resetForm(); }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'url'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Link2 className="w-5 h-5 inline mr-2" />
              Check URL
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeTab === 'email' ? (
              <div className="space-y-6">
                {/* File Upload Section */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors relative">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload text file"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <Upload className="w-10 h-10 text-indigo-500 mb-3" />
                    <p className="text-sm font-medium text-gray-900">
                      Upload a .txt file to auto-fill
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Subject will be set to "not mentioned" automatically
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative bg-white px-4 text-sm text-gray-500 uppercase">Or fill manually</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sender Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    placeholder="sender@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Body *
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Paste the email content here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                <button
                  onClick={handleEmailCheck}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Analyze Email
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL to Check *
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com or http://suspicious-site.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tips for spotting phishing URLs:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Check for misspellings (paypa1.com instead of paypal.com)</li>
                      <li>Look for suspicious domains (.xyz, .tk, unusual extensions)</li>
                      <li>Verify HTTPS and legitimate certificate</li>
                      <li>Be cautious of shortened URLs</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleUrlCheck}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Analyze URL
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className={`mt-8 p-6 rounded-xl border-2 ${
                result.spam
                  ? 'bg-red-50 border-red-300'
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-start gap-4">
                  {result.spam ? (
                    <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      result.spam ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {result.spam ? '⚠️ Threat Detected!' : '✅ Looks Safe'}
                    </h3>
                    <p className={`text-lg leading-relaxed ${
                      result.spam ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {result.description}
                    </p>
                    {result.spam && (
                      <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4 border border-red-200">
                        <p className="text-sm font-semibold text-red-900">⚡ Recommended Actions:</p>
                        <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc list-inside">
                          <li>Do not click any links or download attachments</li>
                          <li>Do not reply or provide any personal information</li>
                          <li>Mark as spam and delete the message</li>
                          <li>Report to your IT department if work-related</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
            <div className="text-sm text-gray-600">Detection Accuracy</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">&lt;2s</div>
            <div className="text-sm text-gray-600">Average Analysis Time</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-pink-600 mb-2">AI</div>
            <div className="text-sm text-gray-600">Powered by Gemini</div>
          </div>
        </div>
      </div>
    </div>
  );
}