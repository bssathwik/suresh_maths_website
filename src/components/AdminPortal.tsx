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

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Resource {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  type: 'pdf' | 'worksheet' | 'youtube';
  url: string;
  description?: string;
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'resources'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('BookOpen');
  const [subjectColor, setSubjectColor] = useState('bg-indigo-500');

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'worksheet' | 'youtube'>('pdf');
  const [resourceURL, setResourceURL] = useState('');
  const [resourceSubjectId, setResourceSubjectId] = useState('');
  const [resourceClassId, setResourceClassId] = useState('X');
  const [resourceDesc, setResourceDesc] = useState('');

  useEffect(() => {
    const qSubjects = query(collection(db, 'subjects'), orderBy('createdAt', 'desc'));
    const unsubscribeSubjects = onSnapshot(qSubjects, (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    });

    const qResources = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    });

    return () => {
      unsubscribeSubjects();
      unsubscribeResources();
    };
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'subjects', editingItem.id), {
          name: subjectName,
          icon: subjectIcon,
          color: subjectColor
        });
      } else {
        const subjectRef = doc(collection(db, 'subjects'));
        await setDoc(subjectRef, {
          id: subjectRef.id,
          name: subjectName,
          icon: subjectIcon,
          color: subjectColor,
          createdAt: serverTimestamp()
        });
      }
      resetForms();
      alert("Subject saved successfully!");
    } catch (error: any) {
      console.error("Error creating subject:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        title: resourceTitle,
        type: resourceType,
        url: resourceURL,
        subjectId: resourceSubjectId,
        classId: resourceClassId,
        description: resourceDesc,
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
    setSubjectName('');
    setResourceTitle('');
    setResourceURL('');
    setResourceDesc('');
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSeedData = async () => {
    if (!confirm("This will seed initial subjects and resources to the database. Continue?")) return;
    
    try {
      console.log("Starting seed...");
      let subjectCount = 0;
      let resourceCount = 0;

      for (const s of mockSubjects) {
        const subjectRef = doc(collection(db, 'subjects'));
        await setDoc(subjectRef, {
          id: subjectRef.id,
          name: s.name,
          icon: s.icon,
          color: s.color,
          createdAt: serverTimestamp()
        });
        subjectCount++;

        // Seed some resources for each subject if any classes have them
        for (const [classId, classData] of Object.entries(s.classes)) {
          const classResources = (classData as any).resources || [];
          for (const res of classResources) {
             const resourceRef = doc(collection(db, 'resources'));
             await setDoc(resourceRef, {
               id: resourceRef.id,
               title: res.title,
               type: res.type,
               url: res.url,
               subjectId: subjectRef.id,
               classId: classId,
               description: res.description || '',
               chapter: res.chapter || 'General',
               createdAt: serverTimestamp()
             });
             resourceCount++;
          }
        }
      }
      alert(`Successfully seeded ${subjectCount} subjects and ${resourceCount} resources!`);
    } catch (error: any) {
      console.error("Seeding error:", error);
      alert(`Seeding failed: ${error.message}. Make sure you are the logged-in admin.`);
    }
  };

  const openEditSubject = (subject: Subject) => {
    setEditingItem(subject);
    setSubjectName(subject.name);
    setSubjectIcon(subject.icon);
    setSubjectColor(subject.color);
    setIsModalOpen(true);
  };

  const openEditResource = (resource: Resource) => {
    setEditingItem(resource);
    setResourceTitle(resource.title);
    setResourceType(resource.type);
    setResourceURL(resource.url);
    setResourceSubjectId(resource.subjectId);
    setResourceClassId(resource.classId);
    setResourceDesc(resource.description || '');
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-1">Manage subjects, resources and quizzes.</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'subjects' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'resources' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Resources
          </button>
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
          Add New {activeTab === 'subjects' ? 'Subject' : 'Resource'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'subjects' ? (
          subjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`${subject.color} p-3 rounded-2xl text-white`}>
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{subject.name}</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{subject.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEditSubject(subject)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete('subjects', subject.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-indigo-600">
                  {resource.type === 'pdf' ? <FileText size={24} /> : resource.type === 'youtube' ? <Youtube size={24} /> : <FileBox size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded-lg text-gray-500 uppercase tracking-wider">Class {resource.classId}</span>
                    <span className="text-xs text-gray-400">{(subjects.find(s => s.id === resource.subjectId)?.name) || 'Unknown Subject'}</span>
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
          ))
        )}
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
                <h2 className="text-2xl font-black">{editingItem ? 'Edit' : 'Add New'} {activeTab === 'subjects' ? 'Subject' : 'Resource'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={activeTab === 'subjects' ? handleCreateSubject : handleCreateResource} className="space-y-6">
                {activeTab === 'subjects' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Subject Name</label>
                      <input
                        required
                        type="text"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium"
                        placeholder="e.g. Advanced Calculus"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Icon</label>
                        <select
                          value={subjectIcon}
                          onChange={(e) => setSubjectIcon(e.target.value)}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium appearance-none"
                        >
                          <option value="Calculator">Calculator</option>
                          <option value="BookOpen">Book</option>
                          <option value="FlaskConical">Science</option>
                          <option value="Globe">Globe</option>
                          <option value="Music">Music</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Color</label>
                        <select
                          value={subjectColor}
                          onChange={(e) => setSubjectColor(e.target.value)}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium appearance-none"
                        >
                          <option value="bg-indigo-500">Indigo</option>
                          <option value="bg-emerald-500">Emerald</option>
                          <option value="bg-purple-500">Purple</option>
                          <option value="bg-rose-500">Rose</option>
                          <option value="bg-amber-500">Amber</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Subject</label>
                        <select
                          required
                          value={resourceSubjectId}
                          onChange={(e) => setResourceSubjectId(e.target.value)}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-medium appearance-none"
                        >
                          <option value="">Select Subject</option>
                          {subjects.length > 0 ? (
                            subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                          ) : (
                            <optgroup label="Samples (Seed Data First)">
                              {mockSubjects.map(s => <option key={s.id} value={s.id} disabled>{s.name} (Not in DB)</option>)}
                            </optgroup>
                          )}
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
                  </>
                )}

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
