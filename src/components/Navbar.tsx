import React, { useState } from 'react';
import { LogOut, Settings, Search, User as UserIcon, Sun, Moon, Menu, X, Home, Info, Phone } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import SureshMathsLogo from './SureshMathsLogo';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onHome: () => void;
  showAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
  onProfile: () => void;
  showProfile: boolean;
}

export default function Navbar({ onHome, showAdmin, setShowAdmin, onProfile, showProfile }: NavbarProps) {
  const { user, isAdmin, signIn, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 px-4 sm:px-6 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between w-full">
        {/* Brand Logo and Name */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          onClick={() => handleMobileNav(onHome)}
        >
          <div className="transition-transform group-hover:scale-105 active:scale-95 duration-200">
            <SureshMathsLogo size={40} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none font-sans">Suresh Maths</h1>
            <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">sureshmathsmaterial</span>
          </div>
        </div>

        {/* Nav links and Auth Actions flex container */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Navigation Links - Desktop Only */}
          <div className="hidden md:flex items-center gap-5 text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
            <button onClick={onHome} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Home</button>
            <a href="#footer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</a>
            <a href="#footer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a>
          </div>

          {/* Theme Toggle Button - Always screen visible */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer flex items-center justify-center shrink-0"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-500 animate-[spin_12s_linear_infinite]" />
            ) : (
              <Moon size={18} className="text-indigo-600" />
            )}
          </button>

          {/* Account Profile / Login Action - Desktop Only */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    onClick={() => setShowAdmin(!showAdmin)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
                  >
                    {showAdmin ? <Search size={14} /> : <Settings size={14} />}
                    <span>{showAdmin ? 'View Site' : 'Admin Panel'}</span>
                  </button>
                )}
                <div 
                  onClick={onProfile}
                  className={`flex items-center gap-2 bg-gray-50 dark:bg-zinc-905 border ${showProfile ? 'border-indigo-500' : 'border-gray-100 dark:border-zinc-800'} hover:border-indigo-505 p-1.5 pr-4 rounded-2xl shadow-sm cursor-pointer transition-all`}
                  title="View Profile & Stats"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                      <UserIcon size={14} />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">My Profile</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); logout(); }} 
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-gray-100 rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 cursor-pointer"
              >
                <UserIcon size={14} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Hamburger / Close Toggle Button - 3 Dashes (Mobile Only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} className="text-gray-950 dark:text-zinc-50" /> : <Menu size={20} className="text-gray-950 dark:text-zinc-50" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Responsive Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-gray-100 dark:border-zinc-900 mt-3 pt-3"
          >
            <div className="flex flex-col gap-2.5 pb-2">
              <button
                onClick={() => handleMobileNav(onHome)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-850 text-gray-700 dark:text-zinc-300 font-bold transition-colors cursor-pointer text-left text-sm"
              >
                <Home size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Home</span>
              </button>
              
              <a
                href="#footer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-850 text-gray-700 dark:text-zinc-300 font-bold transition-colors text-sm"
              >
                <Info size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>About</span>
              </a>

              <a
                href="#footer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-850 text-gray-700 dark:text-zinc-300 font-bold transition-colors text-sm"
              >
                <Phone size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Contact</span>
              </a>

              {/* Admin Panel button - Mobile Placement */}
              {user && isAdmin && (
                <button
                  onClick={() => handleMobileNav(() => setShowAdmin(!showAdmin))}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black transition-colors cursor-pointer text-left text-sm"
                >
                  {showAdmin ? (
                    <>
                      <Search size={18} />
                      <span>View Site Material</span>
                    </>
                  ) : (
                    <>
                      <Settings size={18} />
                      <span>Admin Management Panel</span>
                    </>
                  )}
                </button>
              )}

              {/* Auth details & sign in/out links - Mobile Placement */}
              <div className="border-t border-gray-100 dark:border-zinc-900/65 mt-2 pt-3 px-4">
                {user ? (
                  <div className="flex items-center justify-between gap-4">
                    <div 
                      onClick={() => handleMobileNav(onProfile)}
                      className={`flex items-center gap-3 min-w-0 flex-1 hover:bg-gray-50 dark:hover:bg-zinc-850 p-2 rounded-xl border ${showProfile ? 'border-indigo-500 bg-indigo-50/10' : 'border-transparent'} cursor-pointer transition-all`}
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <UserIcon size={16} />
                        </div>
                      )}
                      <div className="min-w-0 leading-tight">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName || 'Authorized User'}</p>
                        <p className="text-[10px] text-gray-450 dark:text-zinc-500 truncate">My Profile & Stats</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMobileNav(logout)}
                      className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3.5 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMobileNav(signIn)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <UserIcon size={16} />
                    <span>Login with Google</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
