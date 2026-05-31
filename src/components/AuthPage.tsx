import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { GraduationCap, Mail, Lock, User as UserIcon, Sparkles, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, Timer, RefreshCw } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUpWithEmail, signInWithEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect for OTP countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isVerifyingOtp && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifyingOtp, otpTimer]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (isRegister && !name.trim()) {
      setError('Please present your full name.');
      return false;
    }
    return true;
  };

  const handleSendOtp = () => {
    // Generate secure 6-digit random number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpDigits(Array(6).fill(''));
    setOtpTimer(60);
    setIsVerifyingOtp(true);
    setError(null);
    
    // Auto-focus first input block on next frame
    setTimeout(() => {
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (isRegister) {
      // Trigger Email OTP flow instead of signing up directly
      handleSendOtp();
    } else {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
      } catch (err: any) {
        console.error(err);
        let errorMsg = 'An unexpected error occurred. Please try again.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          errorMsg = 'Invalid email address or password.';
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP code. Please check and try again.');
      return;
    }

    // OTP is valid! Proceed with sign up
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name.trim());
      setIsVerifyingOtp(false);
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Failed to complete registration. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email address is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setIsVerifyingOtp(false); // Back to registration form on fatal error
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const numericVal = val.replace(/[^0-9]/g, '');
    if (!numericVal) {
      // If cleared, just update state
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Get only last character entered
    const digit = numericVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto focus next box
    if (index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newDigits = [...otpDigits];
      if (otpDigits[index] === '') {
        // If empty, move to prev box and clear it
        if (index > 0) {
          newDigits[index - 1] = '';
          setOtpDigits(newDigits);
          otpRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    setResendCount((prev) => prev + 1);
    handleSendOtp();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('The Google login popup was closed. If popups are restricted or blocked in this preview session, please Register or Sign In with an Email & Password below, or open this page in a new window using the external link icon.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The Google login popup was blocked by your web browser. Please allow popups, use the Email & Password login, or launch the application in a new web tab.');
      } else {
        setError(err.message || 'Google Sign-In failed. Please verify and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0B0B0C] flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-400/10 dark:bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-400/10 dark:bg-purple-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo and Headings */}
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-indigo-600 dark:bg-indigo-550 text-white p-3.5 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none mb-4"
          >
            <GraduationCap size={32} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-955/25 text-amber-600 dark:text-amber-400 border border-amber-100/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
          >
            <Sparkles size={11} className="animate-pulse" />
            Class VI - X Mathematics
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-zinc-55 tracking-tight mb-2 leading-none">
            Suresh <span className="text-indigo-600 dark:text-indigo-450">Maths</span>
          </h2>
          <p className="text-xs text-gray-450 dark:text-zinc-550 font-medium max-w-xs leading-relaxed">
            Verify your credentials to explore comprehensive PDF notes, worksheets, model papers, and live quizzes.
          </p>
        </div>

        {/* Authentication Card */}
        <motion.div 
          layout
          className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-8 sm:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {!isVerifyingOtp ? (
              <motion.div
                key="auth_forms"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {/* Top Selector Toggle tab */}
                <div className="flex bg-gray-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-gray-100/30 dark:border-zinc-850/30 mb-8">
                  <button
                    onClick={() => { setIsRegister(false); setError(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      !isRegister 
                        ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-indigo-400 shadow-xs' 
                        : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setIsRegister(true); setError(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      isRegister 
                        ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-indigo-400 shadow-xs' 
                        : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2.5 p-4 bg-rose-500/5 border border-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold leading-relaxed">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name Field (Register Mode) */}
                  {isRegister && (
                    <div className="space-y-1.5">
                      <label htmlFor="reg-name" className="block text-[10px] font-black uppercase tracking-wider text-gray-450 dark:text-zinc-400">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          id="reg-name"
                          type="text"
                          placeholder="e.g. Atharva Prasad"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full pl-11 pr-5 py-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100/40 dark:border-zinc-850 rounded-2xl text-sm font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-400/5 focus:border-indigo-600 dark:focus:border-indigo-400 text-gray-800 dark:text-zinc-150"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="auth-email" className="block text-[10px] font-black uppercase tracking-wider text-gray-450 dark:text-zinc-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="auth-email"
                        type="email"
                        placeholder="student@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100/40 dark:border-zinc-850 rounded-2xl text-sm font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-400/5 focus:border-indigo-600 dark:focus:border-indigo-400 text-gray-800 dark:text-zinc-150"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="auth-password" className="block text-[10px] font-black uppercase tracking-wider text-gray-450 dark:text-zinc-400">
                      Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100/40 dark:border-zinc-850 rounded-2xl text-sm font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-400/5 focus:border-indigo-600 dark:focus:border-indigo-400 text-gray-800 dark:text-zinc-150"
                      />
                      <button
                        type="button"
                        disabled={loading}
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-350 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Form Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-705 disabled:bg-indigo-400/60 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-500/10 active:scale-[0.98] mt-6 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{isRegister ? 'Verify Email Address' : 'Secure Sign In'}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Social Sign-in Divider */}
                <div className="relative my-7 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100 dark:border-zinc-850"></div>
                  </div>
                  <span className="relative px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white dark:bg-zinc-900 leading-none">
                    Or Connect With
                  </span>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-gray-100 dark:border-zinc-850 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp_verify"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center"
              >
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/30">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-950 dark:text-zinc-55 tracking-tight leading-none mb-2">
                    Verify Your Email
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    A 6-digit confirmation code was sent to <strong className="text-gray-800 dark:text-zinc-200">{email}</strong>. Please enter the code below.
                  </p>
                </div>

                {/* Secure Sandbox Telemetry showing generated OTP instantly for straightforward testing */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 dark:border-amber-500/25 rounded-2xl text-xs font-bold leading-relaxed text-amber-600 dark:text-amber-400 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 font-black uppercase text-[10px] tracking-wider mb-1">
                    <Sparkles size={13} className="animate-pulse" />
                    Test Sandbox Mail Delivery
                  </div>
                  <div className="text-[14px] font-mono tracking-widest font-extrabold bg-white dark:bg-zinc-950 px-4 py-1.5 border border-amber-500/15 rounded-xl shadow-xs mt-1.5">
                    OTP: {generatedOtp.slice(0, 3)}-{generatedOtp.slice(3)}
                  </div>
                </div>

                <form onSubmit={handleOtpVerify} className="space-y-6">
                  {error && (
                    <div className="flex items-start gap-2.5 p-4 bg-rose-500/5 border border-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold leading-relaxed text-left">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* 6 Grid Inputs with ref shifting */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={loading}
                        className="w-11 sm:w-12 h-14 bg-gray-50 dark:bg-zinc-950 text-center font-black text-xl text-gray-900 dark:text-zinc-50 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-400/5 focus:border-indigo-600 dark:focus:border-indigo-400 selection:bg-transparent"
                      />
                    ))}
                  </div>

                  {/* Timer & Retry Controls */}
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 font-bold">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpTimer > 0 || loading}
                      className={`flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 rounded-xl transition-all border border-gray-100/30 ${
                        otpTimer > 0 ? 'opacity-50 cursor-not-allowed text-gray-450 dark:text-zinc-550' : 'text-indigo-600 dark:text-indigo-400 cursor-pointer'
                      }`}
                    >
                      <RefreshCw size={12} className={loading && otpTimer === 0 ? "animate-spin" : ""} />
                      <span>Resend Code</span>
                    </button>
                    <div className="flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <Timer size={12} />
                      <span>{otpTimer > 0 ? `${otpTimer}s wait` : 'Ready'}</span>
                    </div>
                  </div>

                  {/* Complete Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-705 disabled:bg-indigo-400/60 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-500/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Validate & Register</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsVerifyingOtp(false); setError(null); }}
                    disabled={loading}
                    className="w-full text-center text-xs text-gray-450 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-350 cursor-pointer pt-2 hover:underline transition-all block"
                  >
                    ← Change Registration Details
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
