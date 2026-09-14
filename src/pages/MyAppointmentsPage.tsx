import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  User, 
  Printer, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Phone, 
  ArrowRight,
  Stethoscope,
  Cloud,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { Appointment } from '../types';
import { updateAppointmentStatus } from '../utils/storage';
import { updateAppointmentStatusInFirestore } from '../services/firebaseAppointments';
import { useAuth } from '../context/AuthContext';

interface MyAppointmentsPageProps {
  appointments: Appointment[];
  onAppointmentsChange: (updated: Appointment[]) => void;
  onOpenBooking: () => void;
  onViewSlip: (appointment: Appointment) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({
  appointments,
  onAppointmentsChange,
  onOpenBooking,
  onViewSlip,
  onOpenAuth
}) => {
  const { currentUser, userProfile } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Filter appointments strictly for the active user
  const filteredAppointments = appointments.filter((appt) => {
    // If authenticated, only show appointments owned by this user
    if (currentUser && appt.userId && appt.userId !== currentUser.uid) {
      return false;
    }
    const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;
    const matchesQuery = !searchQuery ||
      appt.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.patientPhone.includes(searchQuery) ||
      appt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalAppt) return;
    setCancelling(true);
    
    // Update local storage scoped to this user
    const updated = updateAppointmentStatus(cancelModalAppt.id, 'cancelled', currentUser?.uid);
    onAppointmentsChange(updated);

    // If authenticated, also sync cancellation to Firestore
    if (currentUser) {
      try {
        await updateAppointmentStatusInFirestore(cancelModalAppt.id, 'cancelled');
      } catch (err) {
        console.warn('Could not sync cancellation to Firestore:', err);
      }
    }

    setCancelling(false);
    setCancelModalAppt(null);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <Calendar className="w-4 h-4" />
            <span>Gunshika Care Central Patient Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Manage Appointments
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Review your upcoming consultations, download digital OPD entry passes, or manage your schedule.
          </p>

          {/* Cloud Account Status Bar */}
          <div className="pt-2 flex justify-center">
            {currentUser ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-teal-200">
                <Cloud className="w-3.5 h-3.5 text-teal-400" />
                <span>Connected: <strong>{userProfile?.fullName || currentUser.displayName || currentUser.email}</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-teal-300">Firebase Cloud Synced</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-teal-500/20 backdrop-blur-md border border-teal-400/30 text-xs text-white">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>Sign in with your patient account to sync across devices</span>
                {onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="ml-1 px-3 py-1 rounded-lg bg-white text-teal-900 font-bold hover:bg-teal-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Controls toolbar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Ref # (e.g. GSC-9482), Name, or Doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Filter Status Pills & New Booking CTA */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'confirmed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'cancelled'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
              </button>
            </div>

            <button
              onClick={onOpenBooking}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book New Appointment</span>
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Appointments Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? 'No scheduled consultations match your search term.'
                  : 'You do not have any appointments recorded in this browser yet.'}
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Schedule Your First Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => {
              const isConfirmed = appt.status === 'confirmed';
              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                    isConfirmed ? 'border-slate-200 shadow-xs hover:shadow-md' : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Ref, Status, Doctor & Dept */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {appt.bookingReference}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isConfirmed ? 'Confirmed' : 'Cancelled'}
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                          {appt.visitType} Consultation
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{appt.doctorName}</h3>
                        <p className="text-xs text-teal-700 font-semibold">{appt.departmentName}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>Date: <strong className="text-slate-800">{appt.date}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>Slot: <strong className="text-slate-800">{appt.timeSlot}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Desk: <strong className="text-slate-800">{appt.roomNumber}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Patient Details */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 w-full lg:w-72">
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Patient:</span>
                        <strong className="text-slate-800">{appt.patientName}</strong>
                      </div>
                      <div className="text-slate-500 pl-5">
                        <span>Age: {appt.patientAge} yrs • {appt.patientGender}</span>
                      </div>
                      <div className="text-slate-500 pl-5 truncate">
                        <span>Phone: {appt.patientPhone}</span>
                      </div>
                      <div className="text-slate-500 pl-5 pt-1 border-t border-slate-200/60 text-[11px] truncate">
                        <span>Reason: {appt.symptoms}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Fee Payable</span>
                        <span className="text-base font-bold text-slate-900">${appt.consultationFee}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewSlip(appt)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Print or view OPD slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>OPD Slip</span>
                        </button>

                        {isConfirmed && (
                          <button
                            onClick={() => setCancelModalAppt(appt)}
                            className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to cancel appointment <strong className="font-mono">{cancelModalAppt.bookingReference}</strong> with {cancelModalAppt.doctorName} on {cancelModalAppt.date}?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalAppt(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
