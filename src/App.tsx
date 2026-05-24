/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, GraduationCap, Search, Sparkles, User as UserIcon, LogOut, Settings, BookOpenText, ClipboardList, BrainCircuit, Youtube, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './components/Navbar';
import SubjectDetail, { ResourceCard } from './components/SubjectDetail';
import PDFViewer from './components/PDFViewer';
import AdminPortal from './components/AdminPortal';
import { subjects as mockSubjects, Subject, Resource } from './data/mockData';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const pillars = [
  {
    id: 'notes',
    title: 'Comprehensive Notes',
    tag: 'Chapter Guides',
    desc: 'Clear, structured step-by-step PDF notes covering all critical mathematical theorems, concepts, and detailed practice proofs.',
    icon: BookOpenText,
    iconBg: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400',
    tagBg: 'text-red-500 bg-red-50/55 dark:bg-red-950/40 dark:text-red-400',
    borderHover: 'hover:border-red-100 dark:hover:border-red-900/40',
    footerLeft: 'Class VI - X',
    footerRight: 'PDF Format',
    textColor: 'group-hover:text-red-500 dark:group-hover:text-red-400',
  },
  {
    id: 'worksheets',
    title: 'Interactive Worksheets',
    tag: 'Practice Kits',
    desc: 'Solve homework problems and math drills directly on a live validation board or download printable offline-ready worksheets.',
    icon: ClipboardList,
    iconBg: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400',
    tagBg: 'text-blue-500 bg-blue-50/55 dark:bg-blue-950/40 dark:text-blue-400',
    borderHover: 'hover:border-blue-100 dark:hover:border-blue-900/40',
    footerLeft: 'Class VI - X',
    footerRight: 'Interactive',
    textColor: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
  },
  {
    id: 'model-papers',
    title: 'Model Papers',
    tag: 'Exam Blueprint',
    desc: 'Standard, official-style mock test papers curated precisely to guide exam timing, layout familiarity, and problem scoring confidence.',
    icon: Award,
    iconBg: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400',
    tagBg: 'text-emerald-500 bg-emerald-50/55 dark:bg-emerald-950/40 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-100 dark:hover:border-emerald-900/40',
    footerLeft: 'Class VI - X',
    footerRight: 'Mock Board',
    textColor: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
  },
  {
    id: 'quizzes',
    title: 'AI & Live Quizzes',
    tag: 'Gamified Quiz',
    desc: 'Test formulas and speedy problem resolutions under real-time timers with custom AI-generated quiz configurations.',
    icon: BrainCircuit,
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
    tagBg: 'text-purple-600 bg-purple-50/55 dark:bg-purple-950/40 dark:text-purple-400',
    borderHover: 'hover:border-purple-100 dark:hover:border-purple-900/40',
    footerLeft: 'Class VI - X',
    footerRight: 'AI Engine',
    textColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  }
];

function AppContent() {
  const { user, isAdmin, signIn, logout } = useAuth();
  const { theme } = useTheme();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [dbResources, setDbResources] = useState<Resource[]>([]);

  const [sliderScrollLeft, setSliderScrollLeft] = useState(0);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSliderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setSliderScrollLeft(e.currentTarget.scrollLeft);
  };

  useEffect(() => {
    const qRes = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsubscribeRes = onSnapshot(qRes, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setDbResources(docs);
    });
    return () => unsubscribeRes();
  }, []);

  const currentSubjects = mockSubjects;
  const selectedSubject = currentSubjects.find(s => s.id === selectedSubjectId);

  // Compile resources list for instant multi-class search support using only database-uploaded files
  const allResources = (() => {
    const list: (Resource & { classId: string })[] = [];
    
    // Only fetch from database resources containing valid document states
    dbResources.forEach(dbRes => {
      if (dbRes && dbRes.url && dbRes.url.trim() !== '') {
        if (!list.some(r => r.id === dbRes.id || r.url === dbRes.url)) {
          list.push({ ...dbRes, classId: (dbRes as any).classId || 'X' });
        }
      }
    });

    return list;
  })();

  const searchedResources = searchQuery.trim() !== ''
    ? allResources.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0B0B0C] font-sans text-gray-900 dark:text-zinc-100 selection:bg-indigo-100 dark:selection:bg-indigo-950/50 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-300">
      <Navbar 
        onHome={() => { setSelectedSubjectId(null); setSelectedClassId(null); setShowAdmin(false); setSearchQuery(''); }} 
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
              <div className="relative text-center max-w-3xl mx-auto mb-20 mt-4 lg:mt-8">
                {/* Background Design Glows */}
                <div className="absolute left-1/2 -translate-x-1/2 top-12 w-[350px] h-[350px] bg-purple-400/15 dark:bg-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>
                <div className="absolute left-1/3 bottom-10 w-[200px] h-[200px] bg-indigo-300/10 dark:bg-indigo-600/5 blur-[90px] rounded-full pointer-events-none -z-10"></div>

                {/* Left Column Content centered */}
                <div className="w-full">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50/75 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100/50 dark:border-indigo-900/30 backdrop-blur-sm shadow-sm"
                  >
                    <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    The Future of Learning
                  </motion.div>
                  
                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-gray-900 dark:text-white mb-6">
                    Suresh <br/> <span className="text-indigo-600 dark:text-indigo-400">Maths</span>
                  </h1>
                  
                  <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed font-medium">
                    Access high-quality PDF notes and interactive worksheets all in one place.
                  </p>
                  
                  <div className="relative max-w-md mx-auto group">
                    <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search chapters or study materials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[1.25rem] shadow-sm group-focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-400/5 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all font-semibold text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-550"
                    />
                  </div>
                </div>
              </div>

              {searchQuery.trim() !== '' ? (
                <>
                  {/* Search Results */}
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900">Search Results</h2>
                      <p className="text-gray-500 mt-1">Showing matches for "{searchQuery}"</p>
                    </div>
                  </div>

                  {searchedResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchedResources.map((resource) => (
                        <div key={resource.id} className="relative">
                          <span className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm">
                            Class {resource.classId}
                          </span>
                          <ResourceCard
                            resource={resource}
                            onViewPdf={() => setViewingResource(resource)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
                      No chapters or study materials found matching "{searchQuery}".
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Classes Grid */}
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white">Explore Classes</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">Select your grade to start mastering Mathematics.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
                    {['VI', 'VII', 'VIII', 'IX', 'X'].map((cls) => (
                      <motion.button
                        key={cls}
                        whileHover={{ y: -5, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedSubjectId('math');
                          setSelectedClassId(cls);
                        }}
                        className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-xl dark:shadow-[0_0_30px_rgba(139,92,246,0.05)] flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-600 dark:hover:border-indigo-500 group text-center cursor-pointer"
                      >
                        <div className="text-xs font-black text-gray-400 dark:text-gray-550 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-widest">Grade</div>
                        <div className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{cls}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Learning Pillars / Resources Section */}
                  <div className="mb-20 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                      <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                          <Sparkles size={12} />
                          Our Ecosystem
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
                          Four Pillars of Maths Excellence
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
                          Discover how we make mathematics engaging, interactive, and easy to master with these tailored digital resource categories.
                        </p>
                      </div>
                      
                      {/* Navigation buttons */}
                      <div className="flex gap-2.5 self-start md:self-auto">
                        <button 
                          onClick={() => scrollSlider('left')}
                          className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-400 dark:text-gray-500 hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-sm"
                          aria-label="Scroll left"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                          onClick={() => scrollSlider('right')}
                          className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-400 dark:text-gray-550 hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-sm"
                          aria-label="Scroll right"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    <div 
                      ref={sliderRef}
                      onScroll={handleSliderScroll}
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 px-1 scrollbar-none scroll-smooth touch-pan-x"
                    >
                      {pillars.map((pillar) => {
                        const PillarIcon = pillar.icon;
                        return (
                          <motion.div 
                            key={pillar.id}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className={`flex-shrink-0 w-[285px] sm:w-[320px] bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-[0_10px_35px_rgba(0,0,0,0.01)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_20px_45px_rgba(139,92,246,0.05)] ${pillar.borderHover} transition-all group flex flex-col justify-between snap-center select-none cursor-grab active:cursor-grabbing`}
                          >
                            <div>
                              <div className={`p-3 rounded-2xl w-fit mb-5 group-hover:scale-110 transition-transform ${pillar.iconBg}`}>
                                <PillarIcon size={22} />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${pillar.tagBg} px-2 py-0.5 rounded-md`}>
                                {pillar.tag}
                              </span>
                              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-3 mb-2 leading-tight">
                                {pillar.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {pillar.desc}
                              </p>
                            </div>
                            <div className={`mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/65 flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-550 ${pillar.textColor} transition-colors`}>
                              <span>{pillar.footerLeft}</span>
                              <span>{pillar.footerRight}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Progress Indicator Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                      {pillars.map((_, idx) => {
                        let isActive = false;
                        if (sliderRef.current) {
                          const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
                          if (maxScroll > 0) {
                            const scrollRatio = sliderScrollLeft / maxScroll;
                            const activeIdx = Math.round(scrollRatio * (pillars.length - 1));
                            isActive = idx === activeIdx;
                          } else {
                            isActive = idx === 0;
                          }
                        } else {
                          isActive = idx === 0;
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (sliderRef.current) {
                                const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
                                const scrollStep = maxScroll / (pillars.length - 1);
                                sliderRef.current.scrollTo({
                                  left: idx * scrollStep,
                                  behavior: 'smooth'
                                });
                              }
                            }}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive ? 'w-8 bg-indigo-600 dark:bg-indigo-400' : 'w-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
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
                  initialClass={selectedClassId}
                  onBack={() => { setSelectedSubjectId(null); setSelectedClassId(null); }} 
                  onSelectSubject={(id) => setSelectedSubjectId(id)}
                  onViewPdf={(resource) => setViewingResource(resource)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-zinc-900 py-12 px-6 bg-white dark:bg-[#070709] transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 dark:bg-indigo-550 p-1.5 rounded-lg text-white">
                <GraduationCap size={18} />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Suresh Maths</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs"> Empowering students through quality digital education resources and tools. </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-gray-900 dark:text-gray-200 lowercase tracking-tighter">Resources</span>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">PDF Notes</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Worksheets</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Quizzes</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-gray-900 dark:text-gray-200 lowercase tracking-tighter">Support</span>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-50 dark:border-zinc-900/60 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
          © {new Date().getFullYear()} sureshmathsmaterial. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

