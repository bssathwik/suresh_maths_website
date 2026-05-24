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
  Database
} from 'lucide-react';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { subjects as mockSubjects } from '../data/mockData';

interface Resource {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  type: 'pdf' | 'worksheet' | 'youtube';
  url: string;
  description?: string;
  category: 'notes' | 'worksheet' | 'model_paper' | 'interactive_learning';
}

export default function AdminPortal() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Dashboard class filter state
  const [selectedClass, setSelectedClass] = useState<string>('All');

  // Form states
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'worksheet' | 'youtube'>('pdf');
  const [resourceURL, setResourceURL] = useState('');
  const [resourceClassId, setResourceClassId] = useState('X');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceCategory, setResourceCategory] = useState<'notes' | 'worksheet' | 'model_paper'>('notes');

  useEffect(() => {
    const qResources = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as Resource[]);
    });

    return () => {
      unsubscribeResources();
    };
  }, []);

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
      };

      if (editingItem) {
        await updateDoc(doc(db, 'resources', editingItem.id), {
          ...data,
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
    if (confirm("Are you sure you want to delete this?")) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const resetForms = () => {
    setResourceTitle('');
    setResourceURL('');
    setResourceDesc('');
    setResourceCategory('notes');
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleAddNewForClass = (classId: string, category: 'notes' | 'worksheet' | 'model_paper') => {
    resetForms();
    setResourceClassId(classId === 'All' ? 'VI' : classId);
    setResourceCategory(category);
    setResourceType(category === 'model_paper' ? 'pdf' : 'pdf');
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

  const notesCount = notesList.length;
  const worksheetsCount = worksheetsList.length;
  const modelPapersCount = modelPapersList.length;

  const renderResourceCard = (resource: Resource) => {
    return (
      <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            {resource.type === 'pdf' ? <FileText size={20} /> : <FileBox size={20} />}
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

      {/* Main Dual-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Class Selection Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800/80">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-4 px-2">Classes & Dashboards</h2>
            <div className="space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 gap-2 lg:gap-1.5 scrollbar-none">
              {['All', 'VI', 'VII', 'VIII', 'IX', 'X'].map((clsId) => {
                const isActive = selectedClass === clsId;
                const classResourcesCount = resources.filter(r => clsId === 'All' ? true : r.classId === clsId).length;
                return (
                  <button
                    key={clsId}
                    onClick={() => setSelectedClass(clsId)}
                    className={`flex items-center justify-between gap-4 px-4 py-3 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap lg:w-full ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none font-bold' 
                        : 'bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-305 border border-gray-100/70 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={16} className={isActive ? "text-white" : "text-gray-400"} />
                      <span className="text-sm font-semibold">{clsId === 'All' ? 'All Classes' : `Grade ${clsId}`}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${isActive ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-450'}`}>
                      {classResourcesCount}
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
            <div className="flex gap-3">
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

          </div>
        </div>

      </div>

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
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
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
                        setResourceType(targetVal === 'model_paper' ? 'pdf' : 'pdf');
                      }}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-bold text-indigo-600 dark:text-indigo-400 appearance-none cursor-pointer"
                    >
                      <option value="notes">Notes</option>
                      <option value="worksheet">Worksheet</option>
                      <option value="model_paper">Model Paper</option>
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
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">URL</label>
                    <input
                      required
                      type="text"
                      value={resourceURL}
                      onChange={(e) => setResourceURL(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900 dark:text-zinc-50"
                      placeholder="Link or Embed URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Description (Optional)</label>
                  <textarea
                    value={resourceDesc}
                    onChange={(e) => setResourceDesc(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none transition-all font-medium min-h-[100px] text-gray-900 dark:text-zinc-50"
                    placeholder="What is this resource about?"
                  />
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
    </div>
  );
}
