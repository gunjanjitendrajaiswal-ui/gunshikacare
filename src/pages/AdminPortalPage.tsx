import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  DollarSign, 
  Building2, 
  AlertCircle, 
  LogOut, 
  ArrowLeft, 
  SlidersHorizontal,
  Trash2,
  FileText,
  Video,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { Appointment, Doctor } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { 
  getAllStoredAppointments, 
  adminUpdateAppointmentStatus, 
  adminDeleteAppointment,
  saveAppointment
} from '../utils/storage';
import { 
  fetchAllAppointmentsFromFirestore, 
  subscribeAllAppointments,
  updateAppointmentStatusInFirestore,
  adminDeleteAppointmentFromFirestore
} from '../services/firebaseAppointments';
import { AdminBookingModal } from '../components/AdminBookingModal';

interface AdminPortalPageProps {
  onNavigateHome: () => void;
  onViewSlip?: (appointment: Appointment) => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  onNavigateHome,
  onViewSlip
}) => {
  const { currentUser, isAdmin, signInWithEmail, logout } = useAuth();

  // Admin login form state
  const [adminEmailInput, setAdminEmailInput] = useState(ADMIN_EMAIL);
  const [adminPasswordInput, setAdminPasswordInput] = useState('886244');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedApptDetails, setSelectedApptDetails] = useState<Appointment | null>(null);
  const [deleteConfirmAppt, setDeleteConfirmAppt] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all appointments when admin is authenticated
  const loadAppointments = async () => {
    setLoadingAppts(true);
    try {
      // 1. Load from local master repository first
      const localData = getAllStoredAppointments();
      setAppointments(localData);

      // 2. Fetch from Firestore if available
      const remoteData = await fetchAllAppointmentsFromFirestore();
      if (remoteData && remoteData.length > 0) {
        // Merge with local data
        const map = new Map<string, Appointment>();
        localData.forEach((item) => map.set(item.bookingReference || item.id, item));
        remoteData.forEach((item) => map.set(item.bookingReference || item.id, item));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAppointments(merged);
      }
    } catch (err) {
      console.warn('Error loading admin appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAppointments();

      // Setup real-time listener if supported
      const unsubscribe = subscribeAllAppointments((remoteAppts) => {
        if (remoteAppts && remoteAppts.length > 0) {
          setAppointments((prev) => {
            const map = new Map<string, Appointment>();
            prev.forEach((item) => map.set(item.bookingReference || item.id, item));
            remoteAppts.forEach((item) => map.set(item.bookingReference || item.id, item));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      });

      return () => unsubscribe();
    }
  }, [isAdmin]);

  // Handle Admin Sign In
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      await signInWithEmail(adminEmailInput.trim(), adminPasswordInput);
      showToast('Welcome to the Hospital Administration Portal');
    } catch (err: any) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setLoginError('Invalid administrator credentials. Please check your email and password.');
      } else if (err.code === 'auth/too-many-requests') {
        setLoginError('Too many attempts. Please wait a moment and try again.');
      } else {
        setLoginError(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick action: Change status of booking
  const handleStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      // Update locally
      const updated = adminUpdateAppointmentStatus(appointmentId, newStatus);
      setAppointments(updated);

      // Update in Firestore
      try {
        await updateAppointmentStatusInFirestore(appointmentId, newStatus);
      } catch (cloudErr) {
        console.warn('Cloud status update notice:', cloudErr);
      }

      showToast(`Appointment status updated to ${newStatus}`);
      if (selectedApptDetails && selectedApptDetails.id === appointmentId) {
        setSelectedApptDetails({ ...selectedApptDetails, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to change status:', err);
      showToast('Could not update status.');
    }
  };

  // Quick action: Delete booking
  const handleDeleteAppointment = async () => {
    if (!deleteConfirmAppt) return;
    try {
      const updated = adminDeleteAppointment(deleteConfirmAppt.id);
      setAppointments(updated);

      try {
        await adminDeleteAppointmentFromFirestore(deleteConfirmAppt.id);
      } catch (cloudErr) {
        console.warn('Cloud delete notice:', cloudErr);
      }

      showToast(`Booking ${deleteConfirmAppt.bookingReference} removed.`);
      setDeleteConfirmAppt(null);
      if (selectedApptDetails?.id === deleteConfirmAppt.id) {
        setSelectedApptDetails(null);
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
      showToast('Failed to delete booking.');
    }
  };

  // Filter appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((appt) => {
    // Status
    if (statusFilter !== 'all' && appt.status !== statusFilter) return false;

    // Department
    if (deptFilter !== 'all' && appt.departmentId !== deptFilter) return false;

    // Visit type
    if (visitTypeFilter !== 'all' && appt.visitType !== visitTypeFilter) return false;

    // Date
    if (dateFilter === 'today' && appt.date !== todayStr) return false;
    if (dateFilter === 'tomorrow' && appt.date !== tomorrowStr) return false;
    if (dateFilter === 'upcoming' && appt.date < todayStr) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = appt.patientName?.toLowerCase().includes(q);
      const matchRef = appt.bookingReference?.toLowerCase().includes(q);
      const matchPhone = appt.patientPhone?.toLowerCase().includes(q);
      const matchDoc = appt.doctorName?.toLowerCase().includes(q);
      const matchEmail = appt.patientEmail?.toLowerCase().includes(q);
      const matchRoom = appt.roomNumber?.toLowerCase().includes(q);
      return matchName || matchRef || matchPhone || matchDoc || matchEmail || matchRoom;
    }

    return true;
  });

  // Calculate Metrics
  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;
  const totalRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.consultationFee || 100), 0);

  // -------------------------------------------------------------
  // VIEW: ADMIN LOGIN GATEWAY (If not logged in as kashikateam@gmail.com)
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/5">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-8 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-teal-300" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Hospital Admin Portal</h1>
            <p className="text-xs text-teal-200/80 mt-1 max-w-xs mx-auto">
              Gunshika Care Clinical Operations & Centralized OPD Booking Management
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="mb-5 bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 text-xs text-teal-900">
              <div className="flex items-center gap-2 font-bold text-teal-800 mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Hospital Admin Credentials</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Authorized receptionists & administrators only. Use the verified admin credentials below to log in:
              </p>
              <div className="mt-2 space-y-1 font-mono text-[11px] bg-white/80 p-2.5 rounded-lg border border-teal-200/60">
                <div><span className="text-slate-400">Email:</span> <span className="font-bold text-slate-800">kashikateam@gmail.com</span></div>
                <div><span className="text-slate-400">Password:</span> <span className="font-bold text-slate-800">886244</span></div>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="kashikateam@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign In as Hospital Administrator</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminEmailInput('kashikateam@gmail.com');
                    setAdminPasswordInput('886244');
                  }}
                  className="w-full py-2 text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                >
                  Quick Fill Provided Admin Credentials
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Hospital Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED ADMIN CONSOLE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-20 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hospital Central Booking & OPD Console
                </h1>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Desk
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Logged in: <strong className="text-teal-200">{currentUser?.email}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Sync
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Booking (Admin)</span>
            </button>

            <button
              onClick={loadAppointments}
              disabled={loadingAppts}
              title="Refresh Bookings"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAppts ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onNavigateHome}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Patient View</span>
            </button>

            <button
              onClick={() => logout()}
              className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-rose-800/50"
              title="Sign Out Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider">Total Bookings</span>
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">All hospital appointments</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider">Confirmed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{confirmedCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for consultation</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider">Completed</span>
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700">{completedCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Consultations finished</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-rose-500 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider">Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">{cancelledCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Revoked or no-show</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-teal-600 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider">Est. Revenue</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700">${totalRevenue.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400 mt-1">From active appointments</p>
          </div>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, phone, reference (GSC-xxxx), doctor, or room..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Booking</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1 text-slate-500 font-semibold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses ({totalCount})</option>
              <option value="confirmed">Confirmed ({confirmedCount})</option>
              <option value="completed">Completed ({completedCount})</option>
              <option value="cancelled">Cancelled ({cancelledCount})</option>
            </select>

            {/* Department */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Visit Type */}
            <select
              value={visitTypeFilter}
              onChange={(e) => setVisitTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Visit Types</option>
              <option value="in-person">In-Person OPD</option>
              <option value="video">Telehealth Video</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            {/* Date */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Visits</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="upcoming">Upcoming</option>
            </select>

            {(statusFilter !== 'all' || deptFilter !== 'all' || visitTypeFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDeptFilter('all');
                  setVisitTypeFilter('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Patient Bookings Registry</h2>
              <p className="text-xs text-slate-500">
                Showing {filteredAppointments.length} of {totalCount} total appointment records
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Auto-refreshed with Firestore</span>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Appointments Match Filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try adjusting your search criteria or register a new walk-in patient booking.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Booking Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Reference & Date</th>
                    <th className="py-3.5 px-4">Patient Information</th>
                    <th className="py-3.5 px-4">Doctor & Department</th>
                    <th className="py-3.5 px-4">Appointment Slot</th>
                    <th className="py-3.5 px-4">Type & Room</th>
                    <th className="py-3.5 px-4">Fee</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAppointments.map((appt) => {
                    const isToday = appt.date === todayStr;

                    return (
                      <tr key={appt.id} className="hover:bg-teal-50/20 transition-colors">
                        {/* Reference */}
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-teal-700 text-xs">
                            {appt.bookingReference}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Booked: {new Date(appt.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{appt.patientName}</span>
                            {appt.isFirstVisit && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase">
                                New
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{appt.patientPhone}</span>
                          </div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[160px]">
                            {appt.patientEmail} • {appt.patientAge}y / {appt.patientGender}
                          </div>
                        </td>

                        {/* Doctor & Dept */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">{appt.doctorName}</div>
                          <div className="text-slate-500 text-[11px]">{appt.departmentName}</div>
                        </td>

                        {/* Schedule */}
                        <td className="py-4 px-4">
                          <div className={`font-semibold ${isToday ? 'text-teal-700 font-bold' : 'text-slate-800'}`}>
                            {appt.date}
                            {isToday && (
                              <span className="ml-1.5 text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-sm uppercase">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{appt.timeSlot}</span>
                          </div>
                        </td>

                        {/* Mode & Room */}
                        <td className="py-4 px-4">
                          <div className="capitalize font-medium text-slate-700 flex items-center gap-1">
                            {appt.visitType === 'video' ? (
                              <span className="text-blue-700 flex items-center gap-1 text-[11px]">
                                <Video className="w-3 h-3" /> Telehealth
                              </span>
                            ) : appt.visitType === 'urgent' ? (
                              <span className="text-rose-700 flex items-center gap-1 font-bold text-[11px]">
                                <AlertTriangle className="w-3 h-3" /> Urgent OPD
                              </span>
                            ) : (
                              <span className="text-slate-700 text-[11px]">In-Person</span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[10px] mt-0.5 truncate max-w-[120px]">
                            {appt.roomNumber || 'OPD Room 101'}
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">${appt.consultationFee || 120}</div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <select
                            value={appt.status}
                            onChange={(e) => handleStatusChange(appt.id, e.target.value as any)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                              appt.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : appt.status === 'completed'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedApptDetails(appt)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Patient & Clinical Details"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {onViewSlip && (
                              <button
                                onClick={() => onViewSlip(appt)}
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Print Consultation Slip"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setDeleteConfirmAppt(appt)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Appointment Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add New Booking from Admin End */}
      <AdminBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookingCreated={(newAppt) => {
          setAppointments((prev) => [newAppt, ...prev]);
          showToast(`Successfully created booking ${newAppt.bookingReference} for ${newAppt.patientName}`);
        }}
      />

      {/* MODAL: Full Patient Clinical Details */}
      {selectedApptDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-400 font-mono font-bold">
                  {selectedApptDetails.bookingReference}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Appointment Details</h3>
              </div>
              <button
                onClick={() => setSelectedApptDetails(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedApptDetails.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact</span>
                  <span className="font-semibold text-slate-700">{selectedApptDetails.patientPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Email</span>
                  <span className="text-slate-600 truncate block">{selectedApptDetails.patientEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Demographics</span>
                  <span className="text-slate-700 capitalize">{selectedApptDetails.patientAge} yrs • {selectedApptDetails.patientGender}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedApptDetails.departmentName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Consultant:</span>
                  <span className="font-semibold text-slate-800">{selectedApptDetails.doctorName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-teal-700">{selectedApptDetails.date} at {selectedApptDetails.timeSlot}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">OPD Room:</span>
                  <span className="font-semibold text-slate-800">{selectedApptDetails.roomNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-emerald-700">${selectedApptDetails.consultationFee}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Chief Complaints / Clinical Symptoms:</span>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedApptDetails.symptoms || 'No specific symptoms noted.'}
                </p>
              </div>

              {/* Status Update from modal */}
              <div className="pt-2">
                <span className="text-slate-500 font-semibold block mb-1.5">Change Booking Status:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedApptDetails.id, 'confirmed')}
                    className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                      selectedApptDetails.status === 'confirmed'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApptDetails.id, 'completed')}
                    className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                      selectedApptDetails.status === 'completed'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApptDetails.id, 'cancelled')}
                    className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                      selectedApptDetails.status === 'cancelled'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                {onViewSlip && (
                  <button
                    onClick={() => {
                      onViewSlip(selectedApptDetails);
                      setSelectedApptDetails(null);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg cursor-pointer"
                  >
                    Print OPD Slip
                  </button>
                )}
                <button
                  onClick={() => setSelectedApptDetails(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold ml-auto cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteConfirmAppt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Appointment Record?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to permanently remove booking <strong className="text-slate-800">{deleteConfirmAppt.bookingReference}</strong> for {deleteConfirmAppt.patientName}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleDeleteAppointment}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
