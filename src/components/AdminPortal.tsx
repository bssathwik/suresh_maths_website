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

  // Form states
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'worksheet' | 'youtube'>('pdf');
  const [resourceURL, setResourceURL] = useState('');
  const [resourceClassId, setResourceClassId] = useState('X');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceCategory, setResourceCategory] = useState<'notes' | 'worksheet' | 'model_paper' | 'interactive_learning'>('notes');

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
                type: res.type,
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-1">Manage study materials, chapters, and resources.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mb-8">
        <button
          onClick={handleSeedData}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl font-bold shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
        >
          <Database size={20} />
          Seed Sample Data
        </button>
        <button
          onClick={() => { resetForms(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add New Resource
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 p-3 rounded-2xl text-indigo-600">
                {resource.type === 'pdf' ? <FileText size={24} /> : resource.type === 'youtube' ? <Youtube size={24} /> : <FileBox size={24} />}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-[10px] font-black rounded-lg text-indigo-600 uppercase tracking-widest">Class {resource.classId}</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-[10px] font-black rounded-lg text-purple-600 uppercase tracking-widest">{resource.category || 'notes'}</span>
                  <span className="text-xs text-gray-400 font-semibold">Mathematics</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => openEditResource(resource)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                <Edit2 size={20} />
              </button>
              <button onClick={() => handleDelete('resources', resource.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Resource Settings</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateResource} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Resource Title</label>
                  <input
                    required
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium"
                    placeholder="e.g. Chapter 1: Introduction to Functions"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</label>
                    <select
                      value={resourceCategory}
                      onChange={(e) => setResourceCategory(e.target.value as any)}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-none rounded-2xl focus:bg-white focus:outline-none transition-all font-bold appearance-none select-none text-indigo-600"
                    >
                      <option value="notes">Notes</option>
                      <option value="worksheet">Worksheet</option>
                      <option value="model_paper">Model Paper</option>
                      <option value="interactive_learning">Interactive Learning</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Class</label>
                    <select
                      value={resourceClassId}
                      onChange={(e) => setResourceClassId(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium appearance-none"
                    >
                      {['VI', 'VII', 'VIII', 'IX', 'X'].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Type</label>
                    <select
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value as any)}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium appearance-none"
                    >
                      <option value="pdf">PDF Link</option>
                      <option value="youtube">YouTube Embed</option>
                      <option value="worksheet">Worksheet Link</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">URL</label>
                    <input
                      required
                      type="text"
                      value={resourceURL}
                      onChange={(e) => setResourceURL(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium"
                      placeholder="Link or Embed URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description (Optional)</label>
                  <textarea
                    value={resourceDesc}
                    onChange={(e) => setResourceDesc(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium min-h-[100px]"
                    placeholder="What is this resource about?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4"
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
