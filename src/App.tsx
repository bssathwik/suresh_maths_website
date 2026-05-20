/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, GraduationCap, Search, Sparkles, User as UserIcon, LogOut, Settings } from 'lucide-react';
import Navbar from './components/Navbar';
import SubjectCard from './components/SubjectCard';
import SubjectDetail from './components/SubjectDetail';
import PDFViewer from './components/PDFViewer';
import AdminPortal from './components/AdminPortal';
import { subjects as mockSubjects, Subject, Resource } from './data/mockData';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function AppContent() {
  const { user, isAdmin, signIn, logout } = useAuth();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'subjects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Update with DB subjects if they exist, otherwise it stays empty and we fallback to mock
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      setDbSubjects(docs);
    });
    return () => unsubscribe();
  }, []);

  const currentSubjects = dbSubjects.length > 0 ? dbSubjects : mockSubjects;
  const selectedSubject = currentSubjects.find(s => s.id === selectedSubjectId);

  const filteredSubjects = currentSubjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar 
        onHome={() => { setSelectedSubjectId(null); setShowAdmin(false); }} 
        showAdmin={showAdmin}
        setShowAdmin={setShowAdmin}
      />

      <main>
        <AnimatePresence mode="wait">
          {showAdmin && isAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminPortal />
            </motion.div>
          ) : viewingResource ? (
            <motion.div
              key="pdf-viewer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed inset-0 z-50 bg-white"
            >
              <PDFViewer 
                url={viewingResource.url} 
                title={viewingResource.title} 
                onClose={() => setViewingResource(null)} 
              />
            </motion.div>
          ) : !selectedSubjectId ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto px-6 py-12"
            >
              {/* Hero Section */}
              <div className="flex flex-col lg:flex-row gap-12 items-center mb-24">
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                  >
                    <Sparkles size={14} />
                    The Future of Learning
                  </motion.div>
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9] text-gray-900 mb-6">
                    Suresh <br/> <span className="text-indigo-600">Maths</span>
                  </h1>
                  <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                    Access high-quality PDF notes, interactive worksheets, and engaging video tutorials all in one place.
                  </p>
                  
                  <div className="relative max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-10 animate-pulse"></div>
                  <div className="relative grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                      <GraduationCap className="text-indigo-600 mb-3" size={32} />
                      <span className="text-2xl font-black">12k+</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Students</span>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center translate-y-8">
                      <TrendingUp className="text-emerald-500 mb-3" size={32} />
                      <span className="text-2xl font-black">98%</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects Grid */}
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Explore Subjects</h2>
                  <p className="text-gray-500 mt-1">Pick a subject to start your journey.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onClick={() => setSelectedSubjectId(subject.id)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {selectedSubject && (
                <SubjectDetail 
                  subject={selectedSubject} 
                  subjects={currentSubjects}
                  onBack={() => setSelectedSubjectId(null)} 
                  onSelectSubject={(id) => setSelectedSubjectId(id)}
                  onViewPdf={(resource) => setViewingResource(resource)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={18} />
              </div>
              <span className="text-lg font-bold">Suresh Maths</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs"> Empowering students through quality digital education resources and tools. </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-gray-900 lowercase tracking-tighter">Resources</span>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">PDF Notes</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Worksheets</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Quizzes</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-gray-900 lowercase tracking-tighter">Support</span>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Contact</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">FAQ</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-50 text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} sureshmathsmaterial. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

