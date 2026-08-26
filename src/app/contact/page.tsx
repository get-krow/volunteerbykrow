'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Clock, Building2, HelpCircle, MessageSquare, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { UserProfile } from '@/lib/types';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ContactPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [category, setCategory] = useState<'hours_inquiry' | 'org_verification' | 'general' | 'other'>('hours_inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const u = db.getCurrentUser();
    if (u) {
      setCurrentUser(u);
      setUserName(u.name || '');
      setUserEmail(u.email || '');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !subject.trim() || !message.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    db.submitContactMessage({
      user_id: currentUser?.id,
      user_name: userName,
      user_email: userEmail,
      category,
      subject,
      message,
    });

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#635BFF] hover:text-[#5046E5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-100/50 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-[#635BFF] rounded-full text-xs font-bold">
            <Mail className="w-3.5 h-3.5" /> Contact Krow Support
          </div>
          <h1 className="text-2xl font-black text-gray-900">How Can We Help You?</h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Have questions about wrong volunteer hours, need your organization verified, or have general feedback? 
            Send us a message directly and Krow administrators will review it.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900">Message Sent Successfully!</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Thank you for reaching out. Your message has been routed to the Krow Admin portal. 
                  We will review your inquiry and follow up shortly.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#635BFF] rounded-xl text-xs font-bold transition-colors"
                >
                  Send Another Message
                </button>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-[#635BFF] hover:bg-[#5046E5] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selector Chips */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">Select Inquiry Category:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCategory('hours_inquiry')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      category === 'hours_inquiry'
                        ? 'border-[#635BFF] bg-purple-50/60 ring-2 ring-[#635BFF]/20 text-[#635BFF]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">Hours Inquiry / Wrong Hours</div>
                      <div className="text-[10px] text-gray-500">Correct missing or incorrect total hours</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('org_verification')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      category === 'org_verification'
                        ? 'border-[#635BFF] bg-purple-50/60 ring-2 ring-[#635BFF]/20 text-[#635BFF]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">Organization Verification</div>
                      <div className="text-[10px] text-gray-500">Request badge verification for your org</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('general')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      category === 'general'
                        ? 'border-[#635BFF] bg-purple-50/60 ring-2 ring-[#635BFF]/20 text-[#635BFF]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">General Question & Feedback</div>
                      <div className="text-[10px] text-gray-500">Platform assistance or suggestions</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('other')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      category === 'other'
                        ? 'border-[#635BFF] bg-purple-50/60 ring-2 ring-[#635BFF]/20 text-[#635BFF]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">Other Support</div>
                      <div className="text-[10px] text-gray-500">Anything else we can help with</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name & Email inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    category === 'hours_inquiry'
                      ? 'e.g. Total hours showing 10 instead of 15'
                      : category === 'org_verification'
                      ? 'e.g. Verification request for Vancouver Food Bank'
                      : 'e.g. Question about certificate downloads'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              {/* Message textarea */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Details</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide any relevant details so our administrators can quickly assist you..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#635BFF] hover:bg-[#5046E5] text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message to Krow Admin
              </button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
