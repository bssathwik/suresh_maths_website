import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Award, 
  BookMarked, 
  Trophy, 
  History, 
  Sparkles, 
  Clock, 
  Trash2, 
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Target
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Resource } from '../data/mockData';

interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  classId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface UserProfileProps {
  onBackToClass: () => void;
  onViewPdf: (resource: Resource) => void;
  onExploreQuizzes: () => void;
}

export default function UserProfile({ onBackToClass, onViewPdf, onExploreQuizzes }: UserProfileProps) {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'bookmarks' | 'achievements'>('quizzes');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);

  const userEmail = user?.email || 'anonymous';

  // Load Quiz Attempts & Bookmarks
  useEffect(() => {
    try {
      const attemptsKey = `quiz_attempts_${userEmail}`;
      const savedAttempts = JSON.parse(localStorage.getItem(attemptsKey) || '[]');
      setAttempts(savedAttempts);

      const bookmarksKey = `bookmarks_${userEmail}`;
      const savedBookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]');
      setBookmarkedResources(savedBookmarks);
    } catch (e) {
      console.error("Error loading profile data:", e);
    }
  }, [userEmail]);

  // Handle Clear Attempts History
  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your quiz history?")) {
      try {
        const attemptsKey = `quiz_attempts_${userEmail}`;
        localStorage.removeItem(attemptsKey);
        setAttempts([]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Handle Remove Bookmark
  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const bookmarksKey = `bookmarks_${userEmail}`;
      const updated = bookmarkedResources.filter(r => r.id !== id);
      setBookmarkedResources(updated);
      localStorage.setItem(bookmarksKey, JSON.stringify(updated));
    } catch (error) {
      console.error(error);
    }
  };

  // Stat Calculations
  const totalAttempts = attempts.length;
  const perfectScores = attempts.filter(a => a.score === a.totalQuestions && a.totalQuestions > 0).length;
  const averageAccuracy = totalAttempts > 0 
    ? Math.round((attempts.reduce((sum, current) => sum + (current.score / current.totalQuestions), 0) / totalAttempts) * 100) 
    : 0;

  // Badge list logic
  const badges = [
    {
      id: 'scholar',
      title: isAdmin ? 'Suresh Maths Host' : 'Suresh scholar',
      desc: isAdmin ? 'Platform Administrator Access' : 'Registered user of Suresh Maths community.',
      unlocked: true,
      icon: ShieldCheck,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'quizmaster',
      title: 'Quiz Practitioner',
      desc: 'Completed at least 3 custom classroom quizzes.',
      unlocked: totalAttempts >= 3,
      icon: Trophy,
      color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'perfect',
      title: 'Perfect Scoresman',
      desc: 'Achieved a perfect 100% on any generated quiz.',
      unlocked: perfectScores > 0,
      icon: Sparkles,
      color: 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'explorer',
      title: 'Resource Collector',
      desc: 'Bookmarked at least 2 reference study chapters.',
      unlocked: bookmarkedResources.length >= 2,
      icon: BookMarked,
      color: 'bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400',
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Back button link */}
      <button 
        onClick={onBackToClass}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 cursor-pointer transition-colors"
      >
        <span>← Back to Study Board</span>
      </button>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            {/* Top design accent */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
            
            <div className="relative pt-6 flex flex-col items-center text-center">
              {/* User picture */}
              <div className="relative mb-4">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User Avatar"} 
                    className="w-24 h-24 rounded-3xl border-4 border-white dark:border-zinc-900 shadow-md object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-zinc-900 shadow-md bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-3xl">
                    {user?.displayName ? user.displayName.charAt(0) : <UserIcon size={36} />}
                  </div>
                )}
                {isAdmin && (
                  <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-xl border-2 border-white dark:border-zinc-900 shadow-sm" title="Administrator">
                    <ShieldCheck size={14} />
                  </span>
                )}
              </div>

              {/* Identity details */}
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white truncate max-w-full">
                {user?.displayName || 'Suresh Maths Student'}
              </h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 uppercase font-semibold tracking-wider">
                {isAdmin ? 'Suresh Maths Instructor' : 'Digital Learning Account'}
              </p>

              {/* Divider */}
              <div className="w-full border-t border-gray-50 dark:border-zinc-800/80 my-5"></div>

              {/* Bio List */}
              <div className="w-full space-y-3.5 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <span>Joined: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalAttempts}</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">Quiz Counts</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{averageAccuracy}%</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">Average Score</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab Selection */}
          <div className="flex border-b border-gray-100 dark:border-zinc-800/80">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center gap-2 px-6 py-4.5 border-b-2 font-bold text-sm transition-all cursor-pointer ${activeTab === 'quizzes' ? 'border-indigo-600 text-indigo-605 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'}`}
            >
              <History size={16} />
              <span>Quiz Attempts</span>
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-2 px-6 py-4.5 border-b-2 font-bold text-sm transition-all cursor-pointer ${activeTab === 'bookmarks' ? 'border-indigo-600 text-indigo-605 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'}`}
            >
              <BookMarked size={16} />
              <span>Bookmarked Material</span>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center gap-2 px-6 py-4.5 border-b-2 font-bold text-sm transition-all cursor-pointer ${activeTab === 'achievements' ? 'border-indigo-600 text-indigo-605 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'}`}
            >
              <Award size={16} />
              <span>Honor Badges ({unlockedCount})</span>
            </button>
          </div>

          {/* Current view panel */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              
              {/* QUIZZES TAB */}
              {activeTab === 'quizzes' && (
                <motion.div
                  key="quizzes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-extrabold text-gray-800 dark:text-zinc-200">Recent Quiz Logs</h3>
                    {attempts.length > 0 && (
                      <button 
                        onClick={handleClearHistory}
                        className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Clear Log
                      </button>
                    )}
                  </div>

                  {attempts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-8 flex flex-col items-center">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                        <Trophy size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-zinc-100">No Quizzes Logged Yet</h4>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-sm mt-1 leading-relaxed">
                        Start testing your mathematical formula speed and logical deduction on classroom quizzes.
                      </p>
                      <button 
                        onClick={onExploreQuizzes}
                        className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md transition-colors cursor-pointer"
                      >
                        Launch Interactive Quizzes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attempts.map((attempt) => {
                        const accuracy = Math.round((attempt.score / attempt.totalQuestions) * 100);
                        const isPerfect = attempt.score === attempt.totalQuestions;
                        return (
                          <div 
                            key={attempt.id}
                            className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-810 p-4.5 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                          >
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100 truncate">{attempt.quizTitle}</h4>
                              <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-gray-400">
                                <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Grade {attempt.classId}</span>
                                <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <div className="text-lg font-black text-gray-900 dark:text-zinc-100">
                                  {attempt.score} <span className="text-xs text-gray-400 font-bold">/ {attempt.totalQuestions}</span>
                                </div>
                                <div className={`text-[10px] uppercase font-black tracking-wider ${isPerfect ? 'text-amber-500' : accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-indigo-500' : 'text-gray-400'}`}>
                                  {accuracy}% Accuracy
                                </div>
                              </div>
                              <div className={`p-2.5 rounded-xl ${isPerfect ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' : 'bg-gray-50 dark:bg-zinc-950 text-gray-400'}`}>
                                <Sparkles size={16} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* BOOKMARKS TAB */}
              {activeTab === 'bookmarks' && (
                <motion.div
                  key="bookmarks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-base font-extrabold text-gray-800 dark:text-zinc-200">Saved Study Resource Chapters</h3>

                  {bookmarkedResources.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-8 flex flex-col items-center">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
                        <BookMarked size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-zinc-100">Zero Bookmarks Saved</h4>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-sm mt-1 leading-relaxed">
                        Bookmark worksheets, study notes, formula booklets or interactive links to keep them saved directly inside your student dashboard.
                      </p>
                      <button 
                        onClick={onBackToClass}
                        className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md transition-colors cursor-pointer"
                      >
                        Browse Syllabus Materials
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarkedResources.map((resource) => (
                        <div 
                          key={resource.id}
                          onClick={() => resource.type === 'pdf' ? onViewPdf(resource) : (resource.url ? window.open(resource.url) : null)}
                          className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer relative"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <span className="px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-950 text-gray-400 dark:text-zinc-500 text-[9px] font-black uppercase rounded">
                                Class { (resource as any).classId || 'Study' }
                              </span>
                              <button 
                                onClick={(e) => handleRemoveBookmark(resource.id, e)}
                                className="p-1.5 text-gray-300 hover:text-red-500 dark:text-zinc-650 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-zinc-950 rounded-lg transition-colors cursor-pointer"
                                title="Remove Bookmark"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100 mt-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-405">{resource.title}</h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {resource.description || 'Access high-quality curriculum study notes.'}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-zinc-805/85 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            <span>Open Resource</span>
                            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ACHIEVEMENTS TAB */}
              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-base font-extrabold text-gray-800 dark:text-zinc-200">Achievement Milestone Badges</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {badges.map((badge) => {
                      const IconComponent = badge.icon;
                      return (
                        <div 
                          key={badge.id}
                          className={`border p-5 rounded-2xl flex items-start gap-4 transition-all relative overflow-hidden bg-white dark:bg-zinc-900 ${badge.unlocked ? 'border-gray-100 dark:border-zinc-8ac opacity-100' : 'border-gray-50 dark:border-zinc-800/40 opacity-55'}`}
                        >
                          <div className={`p-3 rounded-xl ${badge.unlocked ? badge.color : 'bg-gray-150 text-gray-400 dark:bg-zinc-850 dark:text-zinc-600'} shrink-0`}>
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-gray-900 dark:text-zinc-100">{badge.title}</h4>
                              {badge.unlocked ? (
                                <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 uppercase rounded">Unlocked</span>
                              ) : (
                                <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 bg-gray-50 dark:bg-zinc-950 text-gray-400 dark:text-zinc-500 uppercase rounded">Locked</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                              {badge.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
          
        </div>

      </div>
    </div>
  );
}
