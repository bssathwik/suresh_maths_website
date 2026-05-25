import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  ClipboardList, 
  Youtube, 
  ChevronLeft, 
  LayoutGrid, 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  BookOpenText, 
  Eye, 
  Download, 
  Info, 
  FileSpreadsheet, 
  GraduationCap,
  FileCode,
  X
} from 'lucide-react';
import { Subject, Resource, Question, Worksheet } from '../data/mockData';
import Quiz from './Quiz';
import InteractiveWorksheet from './InteractiveWorksheet';
import PDFViewer from './PDFViewer';
import { generateQuiz } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface SubjectDetailProps {
  subject: Subject;
  subjects: Subject[];
  initialClass?: string | null;
  onBack: () => void;
  onSelectSubject: (id: string) => void;
  onViewPdf: (resource: Resource) => void;
}

export default function SubjectDetail({ subject, subjects, initialClass = null, onBack, onSelectSubject, onViewPdf }: SubjectDetailProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(initialClass);

  useEffect(() => {
    setSelectedClass(initialClass);
  }, [initialClass]);

  const [activeTab, setActiveTab] = useState<'notes' | 'worksheet' | 'model_paper' | 'quizzes' | 'interactive_learning'>('notes');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeWorksheetId, setActiveWorksheetId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<{ title: string, questions: Question[] } | null>(null);
  const [difficulty, setDifficulty] = useState('Intermediate');

  const [dbResources, setDbResources] = useState<Resource[]>([]);
  const [dbQuizzes, setDbQuizzes] = useState<any[]>([]);
  const [activeHtmlResource, setActiveHtmlResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (!subject.id) return;
    
    const qr = query(collection(db, 'resources'), where('subjectId', '==', subject.id));
    const unsubscribeR = onSnapshot(qr, (snap) => {
      setDbResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as Resource[]);
    }, (err) => {
      console.warn("Firestore onSnapshot error:", err);
    });

    const qq = query(collection(db, 'quizzes'), where('subjectId', '==', subject.id));
    const unsubscribeQ = onSnapshot(qq, (snap) => {
      setDbQuizzes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (err) => {
      console.warn("Firestore onSnapshot error:", err);
    });

    return () => {
      unsubscribeR();
      unsubscribeQ();
    };
  }, [subject.id]);

  const mockClassData = selectedClass ? subject.classes?.[selectedClass] : null;
  
  // Show only database-uploaded files populated from Firestore
  const currentResources = dbResources.filter(
    r => r && r.classId === selectedClass
  ) as Resource[];

  const currentQuizzes = [
    ...(mockClassData?.quizzes || []),
    ...dbQuizzes.filter(q => q && q.classId === selectedClass)
  ] as any[];

  const activeQuiz = generatedQuiz || currentQuizzes.find(q => q.id === activeQuizId);
  const activeWorksheet = mockClassData?.worksheets?.find(w => w.id === activeWorksheetId);

  const handleGenerateAIQuiz = async () => {
    setIsGenerating(true);
    setGeneratedQuiz(null);
    try {
      const quiz = await generateQuiz(`${subject.name} - Class ${selectedClass}`, difficulty);
      setGeneratedQuiz(quiz);
      setActiveQuizId('ai-generated');
    } catch (error) {
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadWorksheetAsPDF = (ws: Worksheet) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(ws.title, 20, 20);
    doc.setFontSize(14);
    doc.text(`Subject: ${subject.name} - Class ${selectedClass}`, 20, 30);
    doc.line(20, 35, 190, 35);

    let y = 50;
    ws.items.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${item.question}`, 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text("Answer: _______________________", 30, y);
      y += 20;
    });

    doc.save(`${ws.title.replace(/\s+/g, '_')}.pdf`);
  };

  // Group resources helper for Notes and Model Papers
  const renderGroupedResources = (resourcesToRender: Resource[], emptyMessage: string) => {
    const grouped = resourcesToRender.reduce((acc, res) => {
      const chapter = res.chapter || 'General Resources';
      if (!acc[chapter]) acc[chapter] = [];
      acc[chapter].push(res);
      return acc;
    }, {} as { [key: string]: Resource[] });

    const chapters = Object.entries(grouped || {});
    
    if (chapters.length === 0) {
      return (
        <div className="py-25 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
          {emptyMessage}
        </div>
      );
    }

    return chapters.map(([chapter, items]) => (
      <div key={chapter} className="space-y-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">{chapter}</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              onViewPdf={() => onViewPdf(resource)}
              onViewHtml={() => setActiveHtmlResource(resource)}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0B0C] pb-20">
      <div className={`${subject.color} text-white pt-4 pb-8 px-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
        
        <div className="max-w-6xl mx-auto relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-2 group text-sm font-bold"
            >
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-black">
              {subject.name} {selectedClass && <span className="text-white/60 text-xl font-bold ml-2">Class {selectedClass}</span>}
            </h1>
            <p className="text-white/80 mt-1 text-sm">Master your skills with our curated materials.</p>
          </div>
          {selectedClass && (
            <button 
              onClick={() => setSelectedClass(null)}
              className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-white hover:bg-gray-50 transition-colors px-6 py-3 rounded-2xl shadow-sm self-start md:self-auto flex items-center gap-2"
            >
              <ChevronLeft size={14} /> Change Class
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {!selectedClass ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {(() => {
                const availableClasses = subject.classes ? Object.keys(subject.classes) : ['VI', 'VII', 'VIII', 'IX', 'X'];
                return availableClasses.map((cls) => (
                  <motion.button
                    key={cls}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedClass(cls)}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-xl dark:shadow-[0_0_30px_rgba(139,92,246,0.05)] flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-600 dark:hover:border-indigo-500 group cursor-pointer"
                  >
                    <div className="text-xs font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Grade</div>
                    <div className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{cls}</div>
                  </motion.button>
                ));
              })()}
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-[#121214] rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800/80 p-2 flex gap-1 w-full overflow-x-auto mb-8 whitespace-nowrap scrollbar-none">
              <button
                onClick={() => { setActiveTab('notes'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/40'}`}
              >
                <BookOpenText size={16} />
                Notes
              </button>

              <button
                onClick={() => { setActiveTab('worksheet'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'worksheet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/40'}`}
              >
                <ClipboardList size={16} />
                Worksheets
              </button>

              <button
                onClick={() => { setActiveTab('model_paper'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'model_paper' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/40'}`}
              >
                <GraduationCap size={16} />
                Model Paper
              </button>

              <button
                onClick={() => { setActiveTab('quizzes'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/40'}`}
              >
                <BrainCircuit size={16} />
                Quizzes
              </button>

              <button
                onClick={() => { setActiveTab('interactive_learning'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'interactive_learning' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/40'}`}
              >
                <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
                Interactive Learning
              </button>
            </div>

            {/* TAB CONTENT: Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                {renderGroupedResources(
                  currentResources.filter(r => !r.category || r.category === 'notes'),
                  `No notes available for Class ${selectedClass} yet.`
                )}
              </div>
            )}

            {/* TAB CONTENT: Worksheets */}
            {activeTab === 'worksheet' && (
              <div>
                {!activeWorksheetId ? (
                  <div className="space-y-12">
                    {/* Subsection: Interactive Worksheets */}
                    {mockClassData?.worksheets && mockClassData.worksheets.length > 0 && (
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
                          Interactive Worksheets
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {mockClassData.worksheets.map((ws) => (
                            <div key={ws.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                                <ClipboardList size={24} />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{ws.title}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{ws.items.length} Interactive Problems</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setActiveWorksheetId(ws.id)}
                                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100/10 text-center cursor-pointer"
                                >
                                  Start Interactive
                                </button>
                                <button
                                  onClick={() => downloadWorksheetAsPDF(ws)}
                                  className="p-3 bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500 dark:text-gray-400 rounded-xl transition-colors border border-gray-100 dark:border-zinc-800 group/dl cursor-pointer"
                                  title="Download PDF"
                                >
                                  <Download size={20} className="group-hover/dl:scale-110 transition-transform" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subsection: Document Practice Worksheets */}
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
                        Practice Worksheets (PDF/Links)
                      </h3>
                      {renderGroupedResources(
                        currentResources.filter(r => r.category === 'worksheet'),
                        `No practice worksheets available for Class ${selectedClass} yet.`
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <button 
                      onClick={() => setActiveWorksheetId(null)}
                      className="mb-8 text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Close Worksheet
                    </button>
                    <h2 className="text-2xl font-black text-center mb-8">{activeWorksheet?.title}</h2>
                    <InteractiveWorksheet 
                      items={activeWorksheet?.items || []} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Model Papers */}
            {activeTab === 'model_paper' && (
              <div className="space-y-6">
                {renderGroupedResources(
                  currentResources.filter(r => r.category === 'model_paper'),
                  `No model test papers available for Class ${selectedClass} yet.`
                )}
              </div>
            )}

            {/* TAB CONTENT: Quizzes */}
            {activeTab === 'quizzes' && (
              <div>
                {!activeQuizId ? (
                  <div className="space-y-12">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                      <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                        <Sparkles size={120} />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="max-w-md">
                          <h3 className="text-2xl font-bold mb-2">AI Quiz Generator</h3>
                          <p className="text-indigo-100 mb-6 text-sm">Generate a customized quiz for Class {selectedClass} based on your syllabus using Gemini AI.</p>
                          
                          <div className="flex flex-wrap gap-2 mb-6">
                            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => setDifficulty(lvl)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${difficulty === lvl ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={handleGenerateAIQuiz}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                          >
                            {isGenerating ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <Sparkles size={20} className="transition-transform group-hover:scale-110" />
                            )}
                            {isGenerating ? 'Generating Quiz...' : 'Generate New Quiz'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-indigo-600" />
                        Standard Quizzes
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        {currentQuizzes.map((quiz) => (
                          <div key={quiz.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                            <p className="text-gray-500 text-sm mb-6">{quiz.questions.length} Questions</p>
                            <button
                              onClick={() => setActiveQuizId(quiz.id)}
                              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 cursor-pointer"
                            >
                              Start Quiz
                            </button>
                          </div>
                        ))}
                        {currentQuizzes.length === 0 && (
                          <div className="col-span-full py-10 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
                            No standard quizzes available for Class {selectedClass}. Try generating one with AI!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="flex justify-between items-center mb-8">
                      <button 
                        onClick={() => { setActiveQuizId(null); setGeneratedQuiz(null); }}
                        className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft size={16} /> Exit Quiz
                      </button>
                      {generatedQuiz && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Sparkles size={12} />
                          AI Generated
                        </div>
                      )}
                    </div>
                    {activeQuiz && (
                      <div>
                        {generatedQuiz && <h2 className="text-2xl font-black text-center mb-8">{activeQuiz.title}</h2>}
                        <Quiz questions={activeQuiz.questions} onComplete={() => {}} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Interactive Learning */}
            {activeTab === 'interactive_learning' && (
              <div className="space-y-6">
                {renderGroupedResources(
                  currentResources.filter(r => r.category === 'interactive_learning' || r.type === 'html'),
                  `No interactive learning resources available for Class ${selectedClass} yet.`
                )}
              </div>
            )}

          </>
        )}
      </div>

      {/* HTML Resource Viewer Modal */}
      <AnimatePresence>
        {activeHtmlResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveHtmlResource(null)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-[85vh] max-w-6xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-950 dark:text-zinc-50">{activeHtmlResource.title}</h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">Interactive Student Resource</p>
                </div>
                <button 
                  onClick={() => setActiveHtmlResource(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-350 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-[#070708] relative">
                <iframe
                  className="w-full h-full border-0"
                  src={activeHtmlResource.url}
                  sandbox="allow-scripts allow-modals"
                  title={activeHtmlResource.title}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const ResourceCard: React.FC<{ resource: Resource, onViewPdf?: () => void, onViewHtml?: () => void }> = ({ resource, onViewPdf, onViewHtml }) => {
  const Icon = resource.type === 'pdf' ? FileText : resource.type === 'html' ? FileCode : resource.type === 'worksheet' ? ClipboardList : Youtube;
  const iconColor = resource.type === 'pdf' ? 'text-red-500' : resource.type === 'html' ? 'text-indigo-505' : resource.type === 'worksheet' ? 'text-blue-500' : 'text-rose-500';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm group"
    >
      <div className={`p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 w-fit mb-4 group-hover:scale-110 transition-transform ${iconColor}`}>
        <Icon size={24} />
      </div>
      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{resource.title}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">{resource.description || 'Access and work through high quality content.'}</p>
      
      {resource.type === 'youtube' ? (
        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 border border-gray-100 dark:border-zinc-800">
           <iframe
            className="w-full h-full"
            src={resource.url}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer"
            allowFullScreen
          ></iframe>
        </div>
      ) : resource.type === 'pdf' ? (
        <button
          onClick={onViewPdf}
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold transition-colors cursor-pointer"
        >
          <Eye size={18} />
          View Note File
        </button>
      ) : resource.type === 'html' ? (
        <button
          onClick={onViewHtml}
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white dark:text-indigo-100 rounded-xl font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Eye size={18} />
          View Interactive HTML
        </button>
      ) : (
        <a
          href={resource.url}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors text-center cursor-pointer"
        >
          Download Worksheet
        </a>
      )}
    </motion.div>
  );
};
