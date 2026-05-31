import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  FileText, 
  Youtube, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2,
  X,
  LayoutGrid,
  FileBox,
  Database,
  FileCode,
  Globe,
  Sparkles,
  Loader2,
  Brain,
  Users,
  Shield,
  ShieldAlert,
  Search
} from 'lucide-react';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { subjects as mockSubjects } from '../data/mockData';
import { generateQuizWithParams } from '../services/geminiService';

interface Resource {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  type: 'pdf' | 'worksheet' | 'youtube' | 'html';
  url: string;
  description?: string;
  category: 'notes' | 'worksheet' | 'model_paper' | 'interactive_learning';
  isSpecialAccess?: boolean;
}

export default function AdminPortal() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Quiz Editor states
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizClassId, setEditQuizClassId] = useState('VIII');
  const [editQuizQuestions, setEditQuizQuestions] = useState<any[]>([]);
  
  // Dashboard class filter state
  const [selectedClass, setSelectedClass] = useState<string>('All');

  // Form states
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'worksheet' | 'youtube' | 'html'>('pdf');
  const [resourceURL, setResourceURL] = useState('');
  const [resourceClassId, setResourceClassId] = useState('X');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceCategory, setResourceCategory] = useState<'notes' | 'worksheet' | 'model_paper' | 'interactive_learning'>('notes');
  const [resourceIsSpecialAccess, setResourceIsSpecialAccess] = useState(false);

  // AI Quiz Generator states
  const [quizTopic, setQuizTopic] = useState('');
  const [quizType, setQuizType] = useState<'mcq' | 'true_false' | 'mix'>('mcq');
  const [quizDifficulty, setQuizDifficulty] = useState<string>('Beginner');
  const [quizQuestionsCount, setQuizQuestionsCount] = useState<number>(5);
  const [quizClassId, setQuizClassId] = useState<string>('VIII');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // User Control and Access states
  const [activeSection, setActiveSection] = useState<'content' | 'users'>('content');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admins' | 'students'>('all');
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    const qResources = collection(db, 'resources');
    const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as Resource[];
      const sortedItems = [...items].sort((a: any, b: any) => {
        const tA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const tB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return tB - tA;
      });
      setResources(sortedItems);
    });

    const qQuizzes = collection(db, 'quizzes');
    const unsubscribeQuizzes = onSnapshot(qQuizzes, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const sortedItems = [...items].sort((a: any, b: any) => {
        const tA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const tB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return tB - tA;
      });
      setQuizzes(sortedItems);
    });

    const qUsers = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(items);
    }, (error) => {
      console.error("Error subscribing to users in AdminPortal:", error);
    });

    const qAdmins = collection(db, 'admins');
    const unsubscribeAdmins = onSnapshot(qAdmins, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdminsList(items);
    }, (error) => {
      console.error("Error subscribing to admins in AdminPortal:", error);
    });

    return () => {
      unsubscribeResources();
      unsubscribeQuizzes();
      unsubscribeUsers();
      unsubscribeAdmins();
    };
  }, []);

  const handleGenerateAndSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) {
      alert("Please enter a topic.");
      return;
    }
    setIsGeneratingQuiz(true);
    try {
      const generated = await generateQuizWithParams(
        "Mathematics", 
        quizTopic, 
        quizType, 
        quizDifficulty, 
        quizQuestionsCount
      );

      const quizRef = doc(collection(db, 'quizzes'));
      await setDoc(quizRef, {
        id: quizRef.id,
        subjectId: 'math',
        classId: quizClassId,
        title: generated.title,
        questions: generated.questions,
        createdAt: serverTimestamp()
      });

      alert(`Quiz "${generated.title}" generated and saved to Class ${quizClassId} successfully!`);
      setQuizTopic('');
    } catch (error: any) {
      console.error("Quiz generation failed:", error);
      alert(`Quiz generation failed: ${error.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteDoc(doc(db, 'quizzes', id));
        alert("Quiz deleted successfully!");
      } catch (err: any) {
        alert(`Error deleting quiz: ${err.message}`);
      }
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        title: resourceTitle,
        type: resourceType,
        url: resourceURL,
        subjectId: 'math',
        classId: resourceClassId,
        description: resourceDesc,
        category: resourceCategory,
        isSpecialAccess: resourceIsSpecialAccess,
      };

      if (editingItem) {
        await updateDoc(doc(db, 'resources', editingItem.id), {
          ...data,
          id: editingItem.id,
          updatedAt: serverTimestamp()
        });
      } else {
        const resourceRef = doc(collection(db, 'resources'));
        await setDoc(resourceRef, {
          id: resourceRef.id,
          ...data,
          createdAt: serverTimestamp()
        });
      }
      resetForms();
      alert("Resource saved successfully!");
    } catch (error: any) {
      console.error("Error creating resource:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteDoc(doc(db, coll, id));
        alert("Resource deleted successfully!");
      } catch (err: any) {
        console.error("Error deleting resource:", err);
        alert(`Error deleting resource: ${err.message}`);
      }
    }
  };

  const openEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setEditQuizTitle(quiz.title);
    setEditQuizClassId(quiz.classId || 'VIII');
    setEditQuizQuestions(quiz.questions ? JSON.parse(JSON.stringify(quiz.questions)) : []);
    setIsQuizModalOpen(true);
  };

  const handleSaveQuizEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuizTitle.trim()) {
      alert("Please enter a quiz title.");
      return;
    }
    try {
      await updateDoc(doc(db, 'quizzes', editingQuiz.id), {
        id: editingQuiz.id,
        subjectId: editingQuiz.subjectId || 'math',
        title: editQuizTitle,
        classId: editQuizClassId,
        questions: editQuizQuestions,
        updatedAt: serverTimestamp()
      });
      setIsQuizModalOpen(false);
      setEditingQuiz(null);
      alert("Quiz updated successfully!");
    } catch (error: any) {
      console.error("Error updating quiz:", error);
      alert(`Error updating quiz: ${error.message}`);
    }
  };

  const resetForms = () => {
    setResourceTitle('');
    setResourceURL('');
    setResourceDesc('');
    setResourceCategory('notes');
    setResourceIsSpecialAccess(false);
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert("Please upload a valid HTML file (.html or .htm)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawHtml = event.target?.result as string;
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(rawHtml)}`;
      if (dataUrl.length > 800000) {
        alert("This HTML file is too large! Please keep it under 800KB for database storage.");
        return;
      }
      setResourceURL(dataUrl);
      alert(`Successfully loaded HTML file "${file.name}". Ready to be saved!`);
    };
    reader.readAsText(file);
  };

  const handleAddNewForClass = (classId: string, category: 'notes' | 'worksheet' | 'model_paper' | 'interactive_learning') => {
    resetForms();
    setResourceClassId(classId === 'All' ? 'VI' : classId);
    setResourceCategory(category);
    setResourceType(category === 'interactive_learning' ? 'html' : 'pdf');
    setIsModalOpen(true);
  };

  const handleSeedData = async () => {
    if (!confirm("This will seed initial Mathematics resources to the database. Continue?")) return;
    
    try {
      console.log("Starting seed...");
      let resourceCount = 0;

      for (const s of mockSubjects) {
        // Seed some resources for each class
        for (const [classId, classData] of Object.entries(s.classes)) {
          const classResources = (classData as any).resources || [];
          for (const res of classResources) {
             const resourceRef = doc(collection(db, 'resources'));
             await setDoc(resourceRef, {
                id: resourceRef.id,
                title: res.title,
                type: res.type === 'youtube' ? 'pdf' : res.type,
                url: res.url,
                subjectId: 'math',
                classId: classId,
                description: res.description || '',
                chapter: res.chapter || 'General',
                category: res.category || 'notes',
                createdAt: serverTimestamp()
             });
             resourceCount++;
          }
        }
      }
      alert(`Successfully seeded ${resourceCount} Mathematics resources!`);
    } catch (error: any) {
      console.error("Seeding error:", error);
      alert(`Seeding failed: ${error.message}. Make sure you are the logged-in admin.`);
    }
  };

  const openEditResource = (resource: Resource) => {
    setEditingItem(resource);
    setResourceTitle(resource.title);
    setResourceType(resource.type);
    setResourceURL(resource.url);
    setResourceClassId(resource.classId);
    setResourceDesc(resource.description || '');
    setResourceCategory(resource.category || 'notes');
    setResourceIsSpecialAccess(resource.isSpecialAccess || false);
    setIsModalOpen(true);
  };

  // Filter lists based on selected dashboard class filter
  const filteredResources = resources.filter(r => {
    if (selectedClass === 'All') return true;
    return r.classId === selectedClass;
  });

  const notesList = filteredResources.filter(r => r.category === 'notes');
  const worksheetsList = filteredResources.filter(r => r.category === 'worksheet');
  const modelPapersList = filteredResources.filter(r => r.category === 'model_paper');
  const interactiveList = filteredResources.filter(r => r.category === 'interactive_learning' || r.type === 'html');

  const filteredQuizzes = quizzes.filter(q => {
    if (selectedClass === 'All') return true;
    return q.classId === selectedClass;
  });

  const notesCount = notesList.length;
  const worksheetsCount = worksheetsList.length;
  const modelPapersCount = modelPapersList.length;
  const interactiveCount = interactiveList.length;
  const quizzesCount = filteredQuizzes.length;

  const renderResourceCard = (resource: Resource) => {
    return (
      <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            {resource.type === 'pdf' ? (
              <FileText size={20} />
            ) : resource.type === 'html' ? (
              <FileCode size={20} />
            ) : (
              <FileBox size={20} />
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-gray-950 dark:text-zinc-50 truncate">{resource.title}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-[9px] font-black rounded-md text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Class {resource.classId}</span>
              <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-[9px] font-black rounded-md text-purple-600 dark:text-purple-400 uppercase tracking-widest">{resource.category}</span>
              {resource.description && (
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{resource.description}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-zinc-800/80">
          <button onClick={() => openEditResource(resource)} className="p-2 text-gray-400 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDelete('resources', resource.id)} className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const handleToggleAdminRole = async (targetUser: any) => {
    const isTargetAdmin = adminsList.some(admin => admin.id === targetUser.uid);
    setIsUpdatingUser(targetUser.uid);
    try {
      if (isTargetAdmin) {
        if (targetUser.email === 'balabhadrasaisathwik@gmail.com') {
          alert("Cannot demote the supreme platform owner admin!");
          setIsUpdatingUser(null);
          return;
        }
        if (confirm(`Are you sure you want to remove administrator privileges from ${targetUser.displayName || targetUser.email}?`)) {
          await deleteDoc(doc(db, 'admins', targetUser.uid));
          alert("Admin privileges revoked successfully.");
        }
      } else {
        if (confirm(`Are you sure you want to promote ${targetUser.displayName || targetUser.email} to Administrator?`)) {
          await setDoc(doc(db, 'admins', targetUser.uid), {
            email: targetUser.email,
            role: 'admin'
          });
          alert("User promoted to Administrator successfully!");
        }
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      alert(`Failed to update role: ${error.message}`);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleToggleSpecialAccess = async (targetUser: any) => {
    const hasSpecial = !!targetUser.specialAccess;
    setIsUpdatingUser(targetUser.uid);
    try {
      if (confirm(`Are you sure you want to ${hasSpecial ? 'revoke' : 'grant'} Special Access for ${targetUser.displayName || targetUser.email}?`)) {
        await setDoc(doc(db, 'users', targetUser.uid), {
          specialAccess: !hasSpecial
        }, { merge: true });
        alert(`Special Access ${hasSpecial ? 'revoked' : 'granted'} successfully!`);
      }
    } catch (error: any) {
      console.error("Error updating special access:", error);
      alert(`Failed to update special access: ${error.message}`);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleToggleBlockState = async (targetUser: any) => {
    if (targetUser.email === 'balabhadrasaisathwik@gmail.com') {
      alert("Cannot block the platform owner!");
      return;
    }
    const isBlocked = !!targetUser.isBlocked;
    setIsUpdatingUser(targetUser.uid);
    try {
      if (confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} user ${targetUser.displayName || targetUser.email}?`)) {
        await setDoc(doc(db, 'users', targetUser.uid), {
          isBlocked: !isBlocked
        }, { merge: true });
        alert(`User is now ${isBlocked ? 'unblocked' : 'blocked'} successfully!`);
      }
    } catch (error: any) {
      console.error("Error updating block state:", error);
      alert(`Failed to update block state: ${error.message}`);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleDeleteUserRecord = async (targetUser: any) => {
    if (targetUser.email === 'balabhadrasaisathwik@gmail.com') {
      alert("Cannot delete the supreme platform owner account!");
      return;
    }
    if (confirm(`Are you sure you want to delete user ${targetUser.displayName || targetUser.email} from the database? This will clear their registered profile, but won't delete their Firebase auth registration.`)) {
      setIsUpdatingUser(targetUser.uid);
      try {
        await deleteDoc(doc(db, 'users', targetUser.uid));
        const wasAdmin = adminsList.some(admin => admin.id === targetUser.uid);
        if (wasAdmin) {
          await deleteDoc(doc(db, 'admins', targetUser.uid));
        }
        alert("User record removed successfully.");
      } catch (error: any) {
        console.error("Error deleting user record:", error);
        alert(`Failed to delete user record: ${error.message}`);
      } finally {
        setIsUpdatingUser(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 dark:border-zinc-800 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-zinc-50">Admin Management Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage database records and academic resource states.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedData}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 text-gray-700 dark:text-zinc-350 rounded-2xl font-bold shadow-sm hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 text-sm cursor-pointer"
          >
            <Database size={16} />
            Seed Sample Data
          </button>
          <button
            onClick={() => { resetForms(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 text-sm cursor-pointer"
          >
            <Plus size={16} />
            Add New Resource
          </button>
        </div>
      </div>

      {/* Sections Tab Navigation */}
      <div className="flex border-b border-gray-150 dark:border-zinc-800 pb-1 mb-8 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveSection('content')}
          className={`px-5 py-3 text-center text-sm font-black border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeSection === 'content'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-350'
          }`}
        >
          Syllabus Content Library
        </button>
        <button
          onClick={() => setActiveSection('users')}
          className={`px-5 py-3 text-center text-sm font-black border-b-2 cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSection === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-350'
          }`}
        >
          <Users size={16} />
          User Registration & Access Control ({usersList.length})
        </button>
      </div>

      {activeSection === 'content' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Class Selection Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800/80">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-4 px-2">Classes & Dashboards</h2>
            <div className="space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 gap-2 lg:gap-1.5 scrollbar-none">
              {['All', 'VI', 'VII', 'VIII', 'IX', 'X'].map((clsId) => {
                const isActive = selectedClass === clsId;
                const classResourcesCount = resources.filter(r => clsId === 'All' ? true : r.classId === clsId).length;
                const classQuizzesCount = quizzes.filter(q => clsId === 'All' ? true : q.classId === clsId).length;
                const totalCount = classResourcesCount + classQuizzesCount;
                return (
                  <button
                    key={clsId}
                    onClick={() => setSelectedClass(clsId)}
                    className={`flex items-center justify-between gap-4 px-4 py-3 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap lg:w-full ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none font-bold' 
                        : 'bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-355 border border-gray-100/70 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={16} className={isActive ? "text-white" : "text-gray-400"} />
                      <span className="text-sm font-semibold">{clsId === 'All' ? 'All Classes' : `Grade ${clsId}`}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${isActive ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-450'}`}>
                      {totalCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic filtered dashboard displaying fields */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Dashboard Header Banner */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-xl dark:shadow-[0_0_30px_rgba(139,92,246,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full w-max mb-3">
                {selectedClass === 'All' ? 'Global Overview' : `Grade ${selectedClass} Dashboard`}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-50">
                {selectedClass === 'All' ? 'Consolidated Syllabus' : `Mathematics - Class ${selectedClass}`}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-lg leading-relaxed">
                Review and update academic chapters, notes, worksheets and mock models loaded into production.
              </p>
            </div>
            
            {/* Action metric bubbles */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-100/70 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400">{notesCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Notes</span>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-100/70 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{worksheetsCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Worksheets</span>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-100/70 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{modelPapersCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Papers</span>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-100/70 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-2xl font-black text-rose-500 dark:text-rose-400">{interactiveCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Interactive</span>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-100/70 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]">
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{quizzesCount}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Quizzes</span>
              </div>
            </div>
          </div>

          {/* Different Field Container Panels (Interactive Boards) */}
          <div className="space-y-10">
            
            {/* Field A: Notes & Comprehensive Materials */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
                <div className="flex items-center gap-30 max-w-[80%]">
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-zinc-50">Study Notes & Materials</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Academic concept sheets and syllabus breakdowns</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddNewForClass(selectedClass, 'notes')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} /> Add Note
                </button>
              </div>

              {notesList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-100 dark:border-zinc-800/80 rounded-2xl bg-gray-50/30 dark:bg-zinc-950/20">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-3">No study notes uploaded for this section.</p>
                  <button
                    onClick={() => handleAddNewForClass(selectedClass, 'notes')}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
                  >
                    Upload Initial Notes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {notesList.map((res) => renderResourceCard(res))}
                </div>
              )}
            </div>

            {/* Field B: Diagnostic Worksheets */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
                <div className="flex items-center gap-30 max-w-[80%]">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileBox size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-zinc-50">Diagnostic Worksheets</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Practice questions, calculations and assignments</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddNewForClass(selectedClass, 'worksheet')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} /> Add Worksheet
                </button>
              </div>

              {worksheetsList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-100 dark:border-zinc-800/80 rounded-2xl bg-gray-50/30 dark:bg-zinc-950/20">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-3">No practice worksheets uploaded for this section.</p>
                  <button
                    onClick={() => handleAddNewForClass(selectedClass, 'worksheet')}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
                  >
                    Upload Initial Worksheet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {worksheetsList.map((res) => renderResourceCard(res))}
                </div>
              )}
            </div>

            {/* Field C: Model Question Papers */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
                <div className="flex items-center gap-30 max-w-[80%]">
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-zinc-50">Model & Test Papers</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Practice examinations conforming to board standards</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddNewForClass(selectedClass, 'model_paper')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} /> Add Model Paper
                </button>
              </div>

              {modelPapersList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-100 dark:border-zinc-800/80 rounded-2xl bg-gray-50/30 dark:bg-zinc-950/20">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-3">No model papers uploaded for this section.</p>
                  <button
                    onClick={() => handleAddNewForClass(selectedClass, 'model_paper')}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
                  >
                    Upload Initial Model Paper
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {modelPapersList.map((res) => renderResourceCard(res))}
                </div>
              )}
            </div>

            {/* Field D: Interactive Learning & HTML Modules */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
                <div className="flex items-center gap-3 max-w-[80%]">
                  <div className="bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                    <FileCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-zinc-50">Interactive Learning & HTML Modules</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">HTML applications and web-based interactive resources</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddNewForClass(selectedClass, 'interactive_learning')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} /> Add Modules
                </button>
              </div>

              {interactiveList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-100 dark:border-zinc-800/80 rounded-2xl bg-gray-50/30 dark:bg-zinc-950/20">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-3">No interactive modules uploaded for this section.</p>
                  <button
                    onClick={() => handleAddNewForClass(selectedClass, 'interactive_learning')}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
                  >
                    Upload Initial Modules
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {interactiveList.map((res) => renderResourceCard(res))}
                </div>
              )}
            </div>

            {/* Field E: Interactive Quizzes & AI Generator */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
                <div className="bg-teal-50 dark:bg-teal-950/30 p-2.5 rounded-xl text-teal-600 dark:text-teal-400 shrink-0">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-zinc-50">Interactive Quizzes & AI Generator</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Create, generate, and manage interactive student quizzes using Gemini AI</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* AI Quiz Generation Panel */}
                <div className="lg:col-span-5 bg-gray-50/50 dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100/70 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-100">AI Quiz Generator</h4>
                  </div>
                  
                  <form onSubmit={handleGenerateAndSaveQuiz} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Quiz Topic</label>
                      <input
                        required
                        type="text"
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        placeholder="e.g. Linear Equations in Two Variables"
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 dark:text-zinc-50 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Questions</label>
                        <select
                          value={quizQuestionsCount}
                          onChange={(e) => setQuizQuestionsCount(Number(e.target.value))}
                          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900 dark:text-zinc-50 font-medium cursor-pointer"
                        >
                          <option value={3}>3 Questions</option>
                          <option value={5}>5 Questions</option>
                          <option value={10}>10 Questions</option>
                          <option value={15}>15 Questions</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Type</label>
                        <select
                          value={quizType}
                          onChange={(e) => setQuizType(e.target.value as any)}
                          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900 dark:text-zinc-50 font-medium cursor-pointer"
                        >
                          <option value="mcq">MCQ (4 options)</option>
                          <option value="true_false">True / False</option>
                          <option value="mix">Mix of both</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Difficulty</label>
                        <select
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-900 dark:text-zinc-50 font-medium cursor-pointer"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Target Class</label>
                        <select
                          value={quizClassId}
                          onChange={(e) => setQuizClassId(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-gray-905 dark:text-zinc-50 font-medium cursor-pointer"
                        >
                          {['VI', 'VII', 'VIII', 'IX', 'X'].map(c => (
                            <option key={c} value={c}>Class {c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGeneratingQuiz}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Generating & Saving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Generate & Save Quiz</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Quizzes List Panel */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
                    Active Quizzes ({quizzesCount})
                  </h4>

                  {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-100 dark:border-zinc-800/80 rounded-2xl bg-gray-50/20 dark:bg-zinc-950/20">
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No quizzes configured for Class {selectedClass}.</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Use the AI Quiz Generator on the left to create one in seconds!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {filteredQuizzes.map((quiz) => (
                        <div key={quiz.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-100/60 dark:border-zinc-800/80 rounded-xl hover:shadow-sm transition-all gap-4">
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">{quiz.title}</h5>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-[9px] font-black rounded text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Class {quiz.classId}</span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">{quiz.questions?.length || 0} Questions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openEditQuiz(quiz)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                              title="Edit Quiz"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                              title="Delete Quiz"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
      ) : (
        <div className="space-y-6">
          {/* User registration metrics / introduction card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full w-max mb-3">
                Access Center
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-50">
                User Directory & Roles Management
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xl leading-relaxed">
                Review verified learning accounts, award master administrative privileges, or remove profile database states.
              </p>
            </div>

            {/* Quick stats counter blocks */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-150/50 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{usersList.length}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center mt-1">Total Users</span>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-150/50 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-3xl font-black text-amber-500 dark:text-amber-400">{adminsList.length}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center mt-1">Admins</span>
              </div>
              <div className="bg-gray-50/50 dark:bg-zinc-900/60 border border-gray-150/50 dark:border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400">
                  {Math.max(0, usersList.length - adminsList.length)}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center mt-1">Students</span>
              </div>
            </div>
          </div>

          {/* Search and Filters line */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30 dark:bg-zinc-900/10 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800/80">
            {/* Search Input Field */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name or email address..."
                className="w-full pl-11 pr-5 py-3 text-sm bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-0 focus:outline-none rounded-2xl text-gray-955 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
              />
            </div>

            {/* Filter buttons pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  userRoleFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setUserRoleFilter('admins')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  userRoleFilter === 'admins'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                Admins Only
              </button>
              <button
                onClick={() => setUserRoleFilter('students')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  userRoleFilter === 'students'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                Students Only
              </button>
            </div>
          </div>

          {/* Directory Users Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-zinc-50">Registered Learner Accounts</h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Live profiles synced from Google Provider Sign-Ins</p>
              </div>
            </div>

            {usersList.length === 0 ? (
              <div className="py-24 text-center p-8">
                <Users size={48} className="mx-auto text-gray-300 dark:text-zinc-750 mb-4 animate-pulse" />
                <h4 className="text-lg font-black text-gray-800 dark:text-zinc-200">No active users logged</h4>
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                  When students log into their profiles using Google authentication, their information will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-55 dark:divide-zinc-800/60">
                {usersList
                  .filter((usr: any) => {
                    const matchQuery =
                      usr.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                      usr.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
                    if (!matchQuery) return false;

                    const isAd = adminsList.some(admin => admin.id === usr.uid || admin.email === usr.email);
                    if (userRoleFilter === 'admins') return isAd;
                    if (userRoleFilter === 'students') return !isAd;
                    return true;
                  })
                  .map((usr: any) => {
                    const isUserAdmin = adminsList.some(admin => admin.id === usr.uid || admin.email === usr.email);
                    const isChief = usr.email?.toLowerCase() === 'balabhadrasaisathwik@gmail.com';

                    return (
                      <div
                        key={usr.uid || usr.id}
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/40 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        {/* Left Info Column */}
                        <div className="flex items-center gap-4">
                          {/* Image/Avatar */}
                          {usr.photoURL ? (
                            <img
                              src={usr.photoURL}
                              referrerPolicy="no-referrer"
                              alt={usr.displayName || 'Avatar'}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-105 dark:border-zinc-800 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xl border border-indigo-100/30 shrink-0">
                              {usr.displayName ? usr.displayName.charAt(0) : <Users size={22} />}
                            </div>
                          )}

                          {/* Identity Details */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-base text-gray-955 dark:text-zinc-50 truncate">
                                {usr.displayName || 'Anonymous Student'}
                              </h4>

                              {/* Dynamic Roles Badges */}
                              {isChief ? (
                                <span className="bg-amber-100 dark:bg-amber-955/35 text-amber-700 dark:text-amber-450 border border-amber-200/50 dark:border-amber-950 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                                  Supreme Owner
                                </span>
                              ) : isUserAdmin ? (
                                <span className="bg-indigo-50 dark:bg-indigo-955/35 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-950 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                                  Administrator
                                </span>
                              ) : (
                                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-550 dark:text-zinc-455 border border-transparent px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                                  Student Learner
                                </span>
                              )}

                              {/* Special Access badge */}
                              {usr.specialAccess && (
                                <span className="bg-amber-50 dark:bg-amber-955/25 text-amber-600 dark:text-amber-400 border border-amber-200/30 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                                  🔑 Special Access
                                </span>
                              )}

                              {/* Blocked Badge */}
                              {usr.isBlocked && (
                                <span className="bg-rose-100 dark:bg-rose-955/35 text-rose-750 dark:text-rose-400 border border-rose-200 dark:border-rose-950 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                                  🚫 Blocked
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{usr.email}</p>
                            {usr.lastLogin && (
                              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Last Action: {new Date(usr.lastLogin).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Control actions Column */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0 sm:self-center">
                          {/* Toggle Special Access */}
                          {!isChief && (
                            <button
                              disabled={isUpdatingUser === usr.uid}
                              onClick={() => handleToggleSpecialAccess(usr)}
                              className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                                usr.specialAccess
                                  ? 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-150'
                                  : 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                              } disabled:opacity-50`}
                            >
                              <span>{usr.specialAccess ? '🔑 Revoke Access' : '🔑 Grant Access'}</span>
                            </button>
                          )}

                          {/* Toggle Block/Unblock Status */}
                          {!isChief && (
                            <button
                              disabled={isUpdatingUser === usr.uid}
                              onClick={() => handleToggleBlockState(usr)}
                              className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                                usr.isBlocked
                                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600 dark:text-rose-400'
                              } disabled:opacity-50`}
                            >
                              <span>{usr.isBlocked ? '🔓 Unblock' : '🔒 Block'}</span>
                            </button>
                          )}

                          {/* Toggle Admin role privileges */}
                          {!isChief && (
                            <button
                              disabled={isUpdatingUser === usr.uid}
                              onClick={() => handleToggleAdminRole(usr)}
                              className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border ${
                                isUserAdmin
                                  ? 'bg-rose-50 border-rose-100 hover:bg-rose-100 dark:bg-rose-955/20 dark:border-rose-950/30 text-rose-600 dark:text-rose-400'
                                  : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-955/20 dark:border-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                              } disabled:opacity-50`}
                            >
                              {isUpdatingUser === usr.uid ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : isUserAdmin ? (
                                <ShieldAlert size={13} />
                              ) : (
                                <Shield size={13} />
                              )}
                              <span>{isUserAdmin ? 'Revoke Admin' : 'Grant Admin'}</span>
                            </button>
                          )}

                          {/* Delete registry profile entirely */}
                          {!isChief && (
                            <button
                              disabled={isUpdatingUser === usr.uid}
                              onClick={() => handleDeleteUserRecord(usr)}
                              className="p-3 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/20 border border-transparent hover:border-red-100 dark:hover:border-red-950/30 rounded-xl transition-all cursor-pointer"
                              title="Delete User Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50">Resource Settings</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateResource} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Resource Title</label>
                  <input
                    required
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900 dark:text-zinc-50"
                    placeholder="e.g. Chapter 1: Introduction to Functions"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Category</label>
                    <select
                      value={resourceCategory}
                      onChange={(e) => {
                        const targetVal = e.target.value as any;
                        setResourceCategory(targetVal);
                        setResourceType(
                          targetVal === 'model_paper' 
                            ? 'pdf' 
                            : targetVal === 'interactive_learning' 
                            ? 'html' 
                            : 'pdf'
                        );
                      }}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-bold text-indigo-600 dark:text-indigo-400 appearance-none cursor-pointer"
                    >
                      <option value="notes">Notes</option>
                      <option value="worksheet">Worksheet</option>
                      <option value="model_paper">Model Paper</option>
                      <option value="interactive_learning">Interactive Learning</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Class</label>
                    <select
                      value={resourceClassId}
                      onChange={(e) => setResourceClassId(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-950 dark:text-zinc-50 cursor-pointer"
                    >
                      {['VI', 'VII', 'VIII', 'IX', 'X'].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Type</label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value as any)}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-950 dark:text-zinc-50 cursor-pointer"
                    >
                      <option value="pdf">PDF Link</option>
                      <option value="worksheet">Worksheet Link</option>
                      <option value="html">HTML File / Webpage</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Resource URL / Code</label>
                    <input
                      required
                      type="text"
                      value={resourceURL}
                      onChange={(e) => setResourceURL(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900 dark:text-zinc-50"
                      placeholder={resourceType === 'html' ? "Enter URL or auto-fills from upload" : "Link or Embed URL"}
                    />
                  </div>
                </div>

                {resourceType === 'html' && (
                  <div className="space-y-2 p-5 bg-indigo-50/50 dark:bg-[#15151a] border border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-3xl transition-all">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                      Upload Local HTML File
                    </label>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed mb-3">
                      Choose a (.html) file. The content will be securely encoded and embedded into your student resources dashboard.
                    </p>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleHtmlFileUpload}
                      className="block w-full text-xs text-gray-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    {resourceURL && resourceURL.startsWith('data:') && (
                      <div className="mt-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        HTML Content Encoded! ({Math.round(resourceURL.length / 1024)} KB)
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Description (Optional)</label>
                  <textarea
                    value={resourceDesc}
                    onChange={(e) => setResourceDesc(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium min-h-[100px] text-gray-900 dark:text-zinc-50"
                    placeholder="What is this resource about?"
                  />
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl">
                  <input
                    type="checkbox"
                    id="isSpecialAccess"
                    checked={resourceIsSpecialAccess}
                    onChange={(e) => setResourceIsSpecialAccess(e.target.checked)}
                    className="mt-1 w-5 h-5 text-indigo-650 focus:ring-indigo-500 border-gray-150 rounded cursor-pointer"
                  />
                  <label htmlFor="isSpecialAccess" className="text-xs font-bold text-gray-600 dark:text-zinc-300 cursor-pointer select-none leading-relaxed">
                    <span className="block text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider text-[10px] mb-0.5">Special Access Required</span>
                    Require custom authorization state. Students can only view, download, or interaction-preview this material if granted access by you.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4 cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Quiz Editor Modal */}
      <AnimatePresence>
        {isQuizModalOpen && editingQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsQuizModalOpen(false); setEditingQuiz(null); }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50">Edit Quiz</h2>
                  <p className="text-xs text-gray-450 dark:text-gray-500">Edit Quiz title, target class grade, and interactive questions.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => { setIsQuizModalOpen(false); setEditingQuiz(null); }} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Elements */}
              <form onSubmit={handleSaveQuizEdits} className="flex-1 flex flex-col overflow-hidden gap-6">
                {/* Top settings row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 bg-gray-50/50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100/50 dark:border-zinc-850">
                  <div className="sm:col-span-2 space-y-1 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Quiz Title</label>
                    <input
                      required
                      type="text"
                      value={editQuizTitle}
                      onChange={(e) => setEditQuizTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none text-gray-900 dark:text-zinc-50 font-semibold"
                      placeholder="e.g. Fractions Quiz"
                    />
                  </div>
                  <div className="space-y-1 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Target Grade</label>
                    <select
                      value={editQuizClassId}
                      onChange={(e) => setEditQuizClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none text-gray-950 dark:text-zinc-50 font-bold"
                    >
                      {['VI', 'VII', 'VIII', 'IX', 'X'].map(c => <option key={c} value={c}>Grade {c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Scrollable Questions list */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Questions List ({editQuizQuestions.length})</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditQuizQuestions([
                          ...editQuizQuestions,
                          {
                            id: `q-${Date.now()}`,
                            text: 'New Quiz Question?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctAnswer: 0
                          }
                        ]);
                      }}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Question
                    </button>
                  </div>

                  {editQuizQuestions.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-gray-100 dark:border-zinc-805 rounded-2xl bg-gray-50/20 dark:bg-zinc-950/10">
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No quiz questions defined.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {editQuizQuestions.map((q, qIndex) => (
                        <div key={q.id || qIndex} className="p-4 bg-gray-50/40 dark:bg-[#15151a] border border-gray-100/80 dark:border-zinc-800/80 rounded-2xl space-y-4 relative">
                          {/* Question delete trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditQuizQuestions(editQuizQuestions.filter((_, idx) => idx !== qIndex));
                            }}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 dark:text-zinc-550 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 size={14} />
                          </button>

                          {/* Question text */}
                          <div className="space-y-1 pr-8">
                            <label className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Question {qIndex + 1}</label>
                            <input
                              required
                              type="text"
                              value={q.text}
                              onChange={(e) => {
                                const updated = [...editQuizQuestions];
                                updated[qIndex].text = e.target.value;
                                setEditQuizQuestions(updated);
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none text-gray-955 dark:text-zinc-100 font-semibold font-sans"
                              placeholder="Enter question text"
                            />
                          </div>

                          {/* MCQ Options list */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Choices & Correct Solution</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {q.options.map((opt: string, optIndex: number) => {
                                const isCorrect = q.correctAnswer === optIndex;
                                return (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...editQuizQuestions];
                                        updated[qIndex].correctAnswer = optIndex;
                                        setEditQuizQuestions(updated);
                                      }}
                                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                        isCorrect
                                          ? 'border-emerald-500 bg-emerald-500 text-white'
                                          : 'border-gray-250 hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900 text-transparent'
                                      }`}
                                      title="Mark as Correct Answer"
                                    >
                                      <CheckCircle2 size={12} className="stroke-[3]" />
                                    </button>
                                    <input
                                      required
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const updated = [...editQuizQuestions];
                                        updated[qIndex].options[optIndex] = e.target.value;
                                        setEditQuizQuestions(updated);
                                      }}
                                      className={`flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border text-xs focus:outline-none transition-all rounded-xl ${
                                        isCorrect
                                          ? 'border-emerald-300 dark:border-emerald-950 focus:border-emerald-500 font-bold text-emerald-800 dark:text-emerald-400'
                                          : 'border-gray-200 dark:border-zinc-800 focus:border-indigo-500 text-gray-700 dark:text-zinc-300'
                                      }`}
                                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions buttons footer */}
                <div className="flex justify-end gap-3 shrink-0 pt-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => { setIsQuizModalOpen(false); setEditingQuiz(null); }}
                    className="px-5 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none text-xs cursor-pointer"
                  >
                    Save Quiz Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
