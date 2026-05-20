import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  const [isTabFocused, setIsTabFocused] = useState(true);

  useEffect(() => {
    // 1. Prevent Right-Click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // 2. Prevent Keyboard Shortcuts (Save, Print, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print or Save
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        alert('Printing and saving are disabled for security.');
      }
      // PrintScreen (Deterrent - doesn't block all OS-level capture)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText(""); // Clear clipboard
      }
    };

    // 3. Tab Visibility Deterrent
    const handleVisibilityChange = () => {
      setIsTabFocused(document.visibilityState === 'visible');
    };

    const handleBlur = () => setIsTabFocused(false);
    const handleFocus = () => setIsTabFocused(true);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Function to transform Google Drive links for embedding
  const getEmbedUrl = (originalUrl: string) => {
    if (originalUrl.includes('drive.google.com')) {
      // Convert /view or /edit to /preview
      return originalUrl.replace(/\/(view|edit)(\?.*)?$/, '/preview');
    }
    return originalUrl;
  };

  const embedUrl = getEmbedUrl(url);
  const isPlaceholder = url === '#';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen w-full bg-white select-none"
    >
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors flex items-center gap-1 group"
          >
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-bold">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <h3 className="text-lg font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">{title}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <AnimatePresence>
            {!isTabFocused && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-6"
              >
                <div className="bg-white/10 p-4 rounded-full mb-4">
                  <ShieldAlert size={48} className="text-yellow-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Content Shield Active</h4>
                <p className="text-sm text-white/60 max-w-xs">
                  Screenshots and background viewing are restricted. Please focus the window to continue.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
              <div className="max-w-md">
                <div className="bg-indigo-100 text-indigo-600 p-6 rounded-full w-fit mx-auto mb-6">
                  <X size={48} />
                </div>
                <h4 className="text-2xl font-bold mb-2">No PDF File Linked</h4>
                <p className="text-gray-500">This is a mock educational app. In a real application, this viewer would display the actual PDF document from the provided URL.</p>
                <button 
                  onClick={onClose}
                  className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* This overlay masks the top-right pop-out button inherent in Google Drive previews */}
              <div className="absolute top-0 right-0 w-32 h-14 z-10 pointer-events-auto bg-transparent" />
              
              <iframe
                src={embedUrl}
                className="w-full h-full border-none"
                title={title}
                allow="autoplay"
              />
            </>
          )}
        </div>
    </motion.div>
  );
}

