import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ClipboardList, Youtube, ChevronLeft, LayoutGrid, BrainCircuit, Sparkles, Loader2, BookOpenText, Eye, Download, Info } from 'lucide-react';
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
  onBack: () => void;
  onSelectSubject: (id: string) => void;
  onViewPdf: (resource: Resource) => void;
}

export default function SubjectDetail({ subject, subjects, onBack, onSelectSubject, onViewPdf }: SubjectDetailProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resources' | 'worksheets' | 'quizzes'>('resources');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeWorksheetId, setActiveWorksheetId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<{ title: string, questions: Question[] } | null>(null);
  const [difficulty, setDifficulty] = useState('Intermediate');

  const [dbResources, setDbResources] = useState<Resource[]>([]);
  const [dbQuizzes, setDbQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (!subject.id) return;
    
    const qr = query(collection(db, 'resources'), where('subjectId', '==', subject.id));
    const unsubscribeR = onSnapshot(qr, (snap) => {
      setDbResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as Resource[]);
    });

    const qq = query(collection(db, 'quizzes'), where('subjectId', '==', subject.id));
    const unsubscribeQ = onSnapshot(qq, (snap) => {
      setDbQuizzes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    return () => {
      unsubscribeR();
      unsubscribeQ();
    };
  }, [subject.id]);

  const mockClassData = selectedClass ? subject.classes?.[selectedClass] : null;
  
  const currentResources = [
    ...(mockClassData?.resources || []),
    ...dbResources.filter(r => r.classId === selectedClass)
  ] as Resource[];

  const currentQuizzes = [
    ...(mockClassData?.quizzes || []),
    ...dbQuizzes.filter(q => q.classId === selectedClass)
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className={`${subject.color} text-white pt-4 pb-8 px-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-2 group"
          >
            <ChevronLeft size={10} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black">
            {subject.name} {selectedClass && <span className="text-white/60 text-xl font-bold ml-2">Class {selectedClass}</span>}
          </h1>
          <p className="text-white/80 mt-1 text-sm">Master your skills with our curated materials.</p>
          
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">Switch:</span>
            {subjects.filter(s => s.id !== subject.id).map(s => (
              <button
                key={s.id}
                onClick={() => { onSelectSubject(s.id); setSelectedClass(null); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all whitespace-nowrap text-xs font-bold border border-white/5"
              >
                <div className={`w-2 h-2 rounded-full ${s.color}`}></div>
                {s.name}
              </button>
            ))}
          </div>
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
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-600 group"
                  >
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600">Grade</div>
                    <div className="text-4xl font-black text-gray-900 group-hover:text-indigo-600">{cls}</div>
                  </motion.button>
                ));
              })()}
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 flex gap-1 w-fit overflow-x-auto max-w-full">
                <button
                  onClick={() => { setActiveTab('resources'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                  Resources
                </button>
                <button
                  onClick={() => { setActiveTab('worksheets'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'worksheets' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <BookOpenText size={18} />
                  Worksheets
                </button>
                <button
                  onClick={() => { setActiveTab('quizzes'); setActiveQuizId(null); setActiveWorksheetId(null); setGeneratedQuiz(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <BrainCircuit size={18} />
                  Quizzes
                </button>
              </div>

              <button 
                onClick={() => setSelectedClass(null)}
                className="text-sm font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm transition-all"
              >
                <ChevronLeft size={16} /> Switch Class
              </button>
            </div>

            {activeTab === 'resources' ? (
              <div className="space-y-12">
                {(() => {
                  const grouped = currentResources.reduce((acc, res) => {
                    const chapter = res.chapter || 'General Resources';
                    if (!acc[chapter]) acc[chapter] = [];
                    acc[chapter].push(res);
                    return acc;
                  }, {} as { [key: string]: Resource[] });

                  const chapters = Object.entries(grouped || {});
                  
                  if (chapters.length === 0) {
                    return (
                      <div className="py-20 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
                        No resources available for Class {selectedClass} yet.
                      </div>
                    );
                  }

                  return chapters.map(([chapter, items]) => (
                    <div key={chapter} className="space-y-6">
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
                          />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : activeTab === 'worksheets' ? (
              <div>
                {!activeWorksheetId ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockClassData?.worksheets?.map((ws) => (
                      <div key={ws.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 w-fit mb-4 group-hover:scale-110 transition-transform">
                          <BookOpenText size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{ws.title}</h3>
                        <p className="text-gray-500 text-sm mb-6">{ws.items.length} Interactive Tasks</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveWorksheetId(ws.id)}
                            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => downloadWorksheetAsPDF(ws)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors border border-gray-100 group/dl"
                            title="Download PDF"
                          >
                            <Download size={20} className="group-hover/dl:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!mockClassData?.worksheets || mockClassData.worksheets.length === 0) && (
                      <div className="col-span-full py-20 text-center text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
                        No interactive worksheets available for Class {selectedClass} yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <button 
                      onClick={() => setActiveWorksheetId(null)}
                      className="mb-8 text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1"
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
            ) : (
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
                          <p className="text-indigo-100 mb-6 text-sm">Generate a custom quiz for Class {selectedClass} based on your interest using Gemini AI.</p>
                          
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
                            className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
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
                              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
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
                        className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1"
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
          </>
        )}
      </div>
    </div>
  );
}

const ResourceCard: React.FC<{ resource: Resource, onViewPdf?: () => void }> = ({ resource, onViewPdf }) => {
  const Icon = resource.type === 'pdf' ? FileText : resource.type === 'worksheet' ? ClipboardList : Youtube;
  const iconColor = resource.type === 'pdf' ? 'text-red-500' : resource.type === 'worksheet' ? 'text-blue-500' : 'text-rose-500';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group"
    >
      <div className={`p-3 rounded-xl bg-gray-50 w-fit mb-4 group-hover:scale-110 transition-transform ${iconColor}`}>
        <Icon size={24} />
      </div>
      <h4 className="text-lg font-bold text-gray-900 mb-1">{resource.title}</h4>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-2">{resource.description}</p>
      
      {resource.type === 'youtube' ? (
        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 border border-gray-100">
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
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold transition-colors"
        >
          <Eye size={18} />
          View PDF Note
        </button>
      ) : (
        <a
          href={resource.url}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors"
        >
          Download Worksheet
        </a>
      )}
    </motion.div>
  );
};
