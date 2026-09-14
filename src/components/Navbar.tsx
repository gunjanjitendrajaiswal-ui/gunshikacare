import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  Menu, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  Stethoscope,
  User,
  LogOut,
  ChevronDown,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { Page } from '../types';
import { HOSPITAL_INFO } from '../data/hospitalData';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page, param?: string) => void;
  onOpenBooking: (preselectedDoctorId?: string, preselectedDepartmentId?: string) => void;
  appointmentCount: number;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenBooking,
  appointmentCount,
  onOpenAuth
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { id: Page; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'my-appointments', label: 'My Appointments' }
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = userProfile?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Patient';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-slate-200/80">
      {/* Top Emergency & Info Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs sm:text-sm py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>24/7 Emergency & Trauma:</span>
              <a href={`tel:${HOSPITAL_INFO.emergencyPhone}`} className="text-white hover:underline font-bold tracking-wide">
                {HOSPITAL_INFO.emergencyPhone}
              </a>
            </div>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>OPD Timings: Mon-Sat 8:00 AM - 8:00 PM</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="hidden lg:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Medical District, Metro City</span>
            </div>
            <span className="hidden lg:inline-block text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium">JCI & NABH Accredited</span>
            </div>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <button
              id="topbar-admin-portal-btn"
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-teal-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button 
            id="gunshikacare-brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <Heart className="w-6 h-6 fill-white text-teal-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-teal-600 rounded-full" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                  Gunshika<span className="text-teal-600"> Care</span>
                </span>
                <span className="hidden sm:inline text-lg font-light text-slate-500">
                  Hospitals
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                Care with Excellence
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-teal-700 bg-teal-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.id === 'my-appointments' && appointmentCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-600 text-white leading-none">
                      {appointmentCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTA & Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin Console Shortcut button if logged in as Admin */}
            {isAdmin && (
              <button
                id="header-admin-portal-badge-btn"
                onClick={() => handleNavClick('admin')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Console</span>
              </button>
            )}

            {/* User Account / Auth Section */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-account-dropdown-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {initial}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Account Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span>Private & Protected Account</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-teal-800 bg-teal-50/70 hover:bg-teal-100/80 border-b border-teal-100 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Admin Console & Bookings</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavClick('my-appointments')}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Consultations</span>
                      {appointmentCount > 0 && (
                        <span className="ml-auto px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                          {appointmentCount}
                        </span>
                      )}
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-signin-btn"
                onClick={() => onOpenAuth('signin')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all hover:bg-slate-50 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-600" />
                <span>Sign In</span>
              </button>
            )}

            {/* Book Appointment CTA */}
            <button
              id="header-book-appointment-btn"
              onClick={() => onOpenBooking()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold shadow-sm shadow-teal-900/10 hover:shadow-md hover:shadow-teal-900/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => handleNavClick('my-appointments')}
                className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs"
                title={displayName}
              >
                {initial}
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('signin')}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium"
                title="Sign In"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            <button
              id="mobile-book-appointment-quick-btn"
              onClick={() => onOpenBooking()}
              className="inline-flex items-center justify-center p-2.5 rounded-lg bg-teal-600 text-white text-xs font-semibold cursor-pointer"
              title="Book Appointment"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Mobile User Profile Bar */}
          {currentUser ? (
            <div className="p-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                  {initial}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="px-2.5 py-1 rounded-lg text-rose-600 text-xs font-semibold hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-3 mb-2 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-between">
              <span className="text-xs text-teal-800 font-medium">Patient Account</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signin');
                }}
                className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.id === 'my-appointments' && appointmentCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-600 text-white">
                      {appointmentCount}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-semibold text-left transition-colors ${
                currentPage === 'admin'
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-800 bg-teal-50 hover:bg-teal-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Admin Operations Portal</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-200/60 text-teal-900">
                Staff
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Doctor Appointment</span>
            </button>
            
            <a
              href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-center flex items-center justify-center gap-2 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Emergency: {HOSPITAL_INFO.emergencyPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
