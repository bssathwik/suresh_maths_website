import React from 'react';
import { LogOut, Settings, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import SureshMathsLogo from './SureshMathsLogo';

interface NavbarProps {
  onHome: () => void;
  showAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
}

export default function Navbar({ onHome, showAdmin, setShowAdmin }: NavbarProps) {
  const { user, isAdmin, signIn, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Brand Logo and Name */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        onClick={onHome}
      >
        <div className="transition-transform group-hover:scale-105 active:scale-95 duration-200">
          <SureshMathsLogo size={40} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 leading-none">Suresh Maths</h1>
          <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">sureshmathsmaterial</span>
        </div>
      </div>

      {/* Nav links and Auth Actions flex container */}
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        {/* Navigation Links - Hidden on smaller screens to prevent wrapping overlapping */}
        <div className="hidden md:flex items-center gap-4 text-xs sm:text-sm font-semibold text-gray-500 mr-2">
          <button onClick={onHome} className="hover:text-indigo-600 transition-colors">Home</button>
          <a href="#footer" className="hover:text-indigo-600 transition-colors">About</a>
          <a href="#footer" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>

        {/* Dynamic Auth Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && (
                <button
                  onClick={() => setShowAdmin(!showAdmin)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {showAdmin ? <Search size={14} /> : <Settings size={14} />}
                  <span className="hidden xs:inline">{showAdmin ? 'View Site' : 'Admin Panel'}</span>
                  <span className="xs:hidden">{showAdmin ? 'Site' : 'Admin'}</span>
                </button>
              )}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-1 sm:p-1.5 pr-2.5 sm:pr-4 rounded-xl sm:rounded-2xl shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserIcon size={14} />
                  </div>
                )}
                <button 
                  onClick={logout} 
                  className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 px-4 py-1.5 sm:py-2 bg-white border border-gray-100 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
            >
              <UserIcon size={14} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
