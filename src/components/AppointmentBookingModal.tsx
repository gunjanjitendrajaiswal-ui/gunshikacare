import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Video,
  Building2,
  Stethoscope,
  Printer,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  ShieldCheck
} from 'lucide-react';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { Appointment, Doctor, VisitType } from '../types';
import { generateBookingReference, saveAppointment } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { saveAppointmentToFirestore } from '../services/firebaseAppointments';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string;
  preselectedDepartmentId?: string;
  onBookingComplete: (newAppointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctorId,
  preselectedDepartmentId,
  onBookingComplete
}) => {
  const { currentUser, userProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, updateProfileData } = useAuth();

  // Wizard steps: 1: Doctor & Dept, 2: Date & Slot, 3: Patient Info & Auth, 4: Confirmed
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [departmentId, setDepartmentId] = useState<string>('cardiology');
  const [doctorId, setDoctorId] = useState<string>('doc-cardio-1');
  const [visitType, setVisitType] = useState<VisitType>('in-person');
  
  // Date & Time
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // In-modal Auth State (when user is not signed in)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthPassword, setShowAuthPassword] = useState<boolean>(false);

  // Patient Info
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);
  const [symptoms, setSymptoms] = useState<string>('');

  // Submission loading state
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Completed appointment state
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Synchronize authenticated user profile into patient info
  useEffect(() => {
    if (currentUser) {
      if (!patientName && (userProfile?.fullName || currentUser.displayName)) {
        setPatientName(userProfile?.fullName || currentUser.displayName || '');
      }
      if (!patientEmail && currentUser.email) {
        setPatientEmail(currentUser.email);
      }
      if (!patientPhone && userProfile?.phone) {
        setPatientPhone(userProfile.phone);
      }
      if (!patientAge && userProfile?.age) {
        setPatientAge(String(userProfile.age));
      }
      if (userProfile?.gender) {
        setPatientGender(userProfile.gender);
      }
    }
  }, [currentUser, userProfile]);

  // Reset or initialize on modal open
  useEffect(() => {
    if (isOpen) {
      if (preselectedDoctorId) {
        const doc = DOCTORS.find(d => d.id === preselectedDoctorId);
        if (doc) {
          setDoctorId(doc.id);
          setDepartmentId(doc.departmentId);
        }
      } else if (preselectedDepartmentId) {
        setDepartmentId(preselectedDepartmentId);
        const docsInDept = DOCTORS.filter(d => d.departmentId === preselectedDepartmentId);
        if (docsInDept.length > 0) {
          setDoctorId(docsInDept[0].id);
        }
      } else {
        setDepartmentId(DEPARTMENTS[0].id);
        const docs = DOCTORS.filter(d => d.departmentId === DEPARTMENTS[0].id);
        if (docs.length > 0) {
          setDoctorId(docs[0].id);
        }
      }

      // Default date to tomorrow
      const tomorrow = new Date(Date.now() + 86400000);
      const formattedDate = tomorrow.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
      setSelectedTimeSlot('10:00 AM');
      setStep(1);
      setCompletedAppointment(null);
      setErrorMsg('');
      setAuthError(null);
    }
  }, [isOpen, preselectedDoctorId, preselectedDepartmentId]);

  // When department changes, pick first doctor in that dept
  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    const availableDocs = DOCTORS.filter(d => d.departmentId === newDeptId);
    if (availableDocs.length > 0) {
      setDoctorId(availableDocs[0].id);
    }
  };

  if (!isOpen) return null;

  const currentDept = DEPARTMENTS.find(d => d.id === departmentId) || DEPARTMENTS[0];
  const doctorsInDept = DOCTORS.filter(d => d.departmentId === departmentId);
  const selectedDoctor = DOCTORS.find(d => d.id === doctorId) || doctorsInDept[0] || DOCTORS[0];

  // Generate next 7 available dates
  const availableDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() + 86400000 * (i + 1));
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      monthDay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  const timeSlots = [
    { category: 'Morning Slots', slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] },
    { category: 'Afternoon Slots', slots: ['01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'] },
    { category: 'Evening Slots', slots: ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'] }
  ];

  // Auth helpers for in-modal signin/signup
  const getReadableAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Incorrect password. Please enter the right password for this account.';
    }
    if (code === 'auth/user-not-found') {
      return 'No account exists for this email yet. Switch to "Create Account" to register.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email. Please switch to Sign In.';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters long.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before completing.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Google popup was blocked. Please allow popups or use Email & Password.';
    }
    return err?.message || 'Authentication failed. Please verify your credentials.';
  };

  const handleInModalAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    if (authMode === 'signup') {
      if (!authName.trim()) {
        setAuthError('Please enter your full legal name.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        await signInWithEmail(authEmail, authPassword);
      } else {
        await signUpWithEmail(authEmail, authPassword, authName, authPhone);
      }
      setAuthPassword('');
      setAuthError(null);
    } catch (err: any) {
      setAuthError(getReadableAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInModalGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      setAuthError(null);
    } catch (err: any) {
      setAuthError(getReadableAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  // Validation before advancing
  const handleProceedToDetails = () => {
    if (!selectedDate || !selectedTimeSlot) {
      setErrorMsg('Please select an appointment date and preferred time slot.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Patient authentication is required to confirm this booking.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMsg('Please enter the patient full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }
    if (!patientAge || parseInt(patientAge) <= 0 || parseInt(patientAge) > 125) {
      setErrorMsg('Please enter a valid age between 1 and 125.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      userId: currentUser.uid,
      bookingReference: generateBookingReference(),
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || currentUser.email || 'patient@gunshikacare.org',
      patientAge: parseInt(patientAge),
      patientGender,
      isFirstVisit,
      departmentId: currentDept.id,
      departmentName: currentDept.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorTitle: selectedDoctor.title,
      visitType,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      symptoms: symptoms.trim() || 'General Consultation and Diagnostic Evaluation',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      consultationFee: selectedDoctor.consultationFee,
      roomNumber: selectedDoctor.roomNumber
    };

    // 1. Save locally for instant offline/cached reliability
    saveAppointment(newAppt);

    // 2. Save directly to Firebase Firestore and update user profile
    try {
      await saveAppointmentToFirestore(newAppt, currentUser.uid);
      await updateProfileData({
        phone: patientPhone.trim(),
        age: parseInt(patientAge),
        gender: patientGender
      });
    } catch (fbErr) {
      console.warn('Firestore cloud sync notice:', fbErr);
    }

    setSubmitting(false);
    setCompletedAppointment(newAppt);
    setStep(4);
    onBookingComplete(newAppt);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-booking-modal-btn"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-teal-700 to-slate-800 p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Gunshika Care Online Patient OPD Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Book a Doctor Appointment</h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Fast, guaranteed consultation slots with board-certified clinical specialists.
          </p>

          {/* Stepper indicator */}
          {step < 4 && (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-teal-600/50 text-xs font-medium">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-white' : 'text-teal-300/60'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 1 ? 'bg-white text-teal-800' : 'bg-teal-600 text-white'}`}>
                  1
                </span>
                <span>Specialist</span>
              </div>
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-white' : 'text-teal-300/60'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 2 ? 'bg-white text-teal-800' : step > 2 ? 'bg-teal-600 text-white' : 'bg-teal-800/80 text-teal-300'}`}>
                  2
                </span>
                <span>Date & Slot</span>
              </div>
              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-white' : 'text-teal-300/60'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 3 ? 'bg-white text-teal-800' : 'bg-teal-800/80 text-teal-300'}`}>
                  3
                </span>
                <span>Patient Info</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Select Department, Doctor & Visit Type */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Consultation Type Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Select Consultation Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVisitType('in-person')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    visitType === 'in-person'
                      ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">In-Person OPD</span>
                    <span className="text-[11px] text-slate-500">Hospital Clinic Visit</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitType('video')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    visitType === 'video'
                      ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Tele-Health Video</span>
                    <span className="text-[11px] text-slate-500">Online Consultation</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitType('urgent')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    visitType === 'urgent'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-900 ring-2 ring-rose-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Priority / Urgent</span>
                    <span className="text-[11px] text-slate-500">Same-Day Priority Slot</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                1. Select Clinical Department
              </label>
              <select
                id="booking-department-select"
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({DOCTORS.filter(d => d.departmentId === dept.id).length} Doctors Available)
                  </option>
                ))}
              </select>
            </div>

            {/* Multiple Doctors Selection within Department */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Choose Specialist Doctor ({doctorsInDept.length} Specialists)
                </label>
                <span className="text-xs text-teal-600 font-medium">Click to select</span>
              </div>

              <div className="space-y-3">
                {doctorsInDept.map((doc) => {
                  const isSelected = doctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setDoctorId(doc.id)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-2 ring-teal-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={doc.imageUrl}
                          alt={doc.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-teal-700 font-medium">{doc.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {doc.qualification} • {doc.experienceYears}+ yrs experience
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600">
                            <span>Room: {doc.roomNumber}</span>
                            <span>•</span>
                            <span>Fee: <strong className="text-slate-900">${doc.consultationFee}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Available Days</span>
                          <span className="text-xs font-semibold text-slate-700">{doc.availableDays.slice(0, 3).join(', ')}...</span>
                        </div>
                        <div className={`mt-2 w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'}`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 1 Footer Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span>Selected: </span>
                <strong className="text-slate-800">{selectedDoctor.name}</strong>
                <span className="text-teal-700 font-semibold ml-2">(${selectedDoctor.consultationFee})</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Select Date & Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Date & Time Slot */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Selected Doctor Summary Chip */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor.imageUrl}
                  alt={selectedDoctor.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">{selectedDoctor.name}</span>
                  <span className="text-slate-500">{selectedDoctor.departmentName} • {selectedDoctor.roomNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-teal-700 font-semibold hover:underline"
              >
                Change Doctor
              </button>
            </div>

            {/* Date Picker (Pills) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                1. Select Appointment Date
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => setSelectedDate(item.iso)}
                      className={`py-3 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[11px] font-semibold block uppercase opacity-80">{item.dayName}</span>
                      <span className="text-sm font-bold block mt-0.5">{item.monthDay}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                2. Select Preferred Time Slot
              </label>
              <div className="space-y-4">
                {timeSlots.map((group, gIdx) => (
                  <div key={gIdx}>
                    <span className="text-xs font-semibold text-slate-500 mb-2 block">{group.category}</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {group.slots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700 ring-2 ring-teal-600/30'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToDetails}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Account Auth & Details */}
        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Booking Summary strip */}
            <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-100 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-teal-900 font-bold block">{selectedDoctor.name} ({selectedDoctor.departmentName})</span>
                <span className="text-teal-700">Slot: {selectedDate} at {selectedTimeSlot} • Type: {visitType.toUpperCase()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Consultation Fee</span>
                <span className="text-base font-bold text-teal-900">${selectedDoctor.consultationFee}</span>
              </div>
            </div>

            {/* If user is NOT signed in: Display Required Sign In / Sign Up Gate */}
            {!currentUser ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Patient Sign In / Sign Up Required
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Please sign in or create an account to book your consultation. Gunshika Care links each appointment to your patient record for cloud record retention and digital OPD slip generation.
                    </p>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Quick Google Sign In */}
                <button
                  type="button"
                  onClick={handleInModalGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-slate-50 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Or with email
                  </span>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      authMode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleInModalAuthSubmit} className="space-y-3 pt-1">
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="patient@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                        title={showAuthPassword ? 'Hide password' : 'Show only to you'}
                      >
                        {showAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>Encrypted & private. Only you can reveal your password.</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>{authMode === 'signin' ? 'Sign In & Continue Booking' : 'Register & Continue Booking'}</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* If user IS signed in: Show Verified Patient Banner + Clinical Information Form */
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {/* Verified Account Pill */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Signed in as <strong>{userProfile?.fullName || currentUser.displayName || 'Verified Patient'}</strong> ({currentUser.email})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                    Profile Linked
                  </span>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johnathan Vance"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="patient@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Age, Gender & Patient Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="125"
                      required
                      placeholder="e.g. 42"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      Gender *
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as 'male' | 'female' | 'other')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                      Patient History
                    </label>
                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="patientHistory"
                          checked={isFirstVisit}
                          onChange={() => setIsFirstVisit(true)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>First Visit</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="patientHistory"
                          checked={!isFirstVisit}
                          onChange={() => setIsFirstVisit(false)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>Follow-up</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Reason for visit / Symptoms */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Chief Health Complaints / Reason for Visit
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your current symptoms or concerns (e.g. recurring headache, second opinion on ECG, chronic joint pain)..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    id="submit-confirm-appointment-btn"
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-900/15 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Book Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 4: Instant Confirmation Receipt */}
        {step === 4 && completedAppointment && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your consultation has been successfully registered with Gunshika Care central OPD system.
              </p>
            </div>

            {/* Cloud Sync Status Pill */}
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-teal-600" />
                <span>
                  Synchronized to Gunshika Care <strong>Firebase Cloud Database</strong>
                </span>
              </div>
              <span className="font-semibold text-[11px] text-teal-700">Account: {completedAppointment.patientEmail}</span>
            </div>

            {/* Digital Token Slip Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Booking Reference ID
                  </span>
                  <span className="text-xl font-black text-teal-700 font-mono">
                    {completedAppointment.bookingReference}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Confirmed
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{completedAppointment.patientName}</span>
                  <span className="text-slate-500">Age: {completedAppointment.patientAge}, {completedAppointment.patientGender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Doctor:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{completedAppointment.doctorName}</span>
                  <span className="text-teal-700">{completedAppointment.departmentName}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block">Date & Time:</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{completedAppointment.date}</span>
                  <span className="text-slate-700 font-semibold">{completedAppointment.timeSlot}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>Room / Desk: <strong className="text-slate-800">{completedAppointment.roomNumber}</strong></span>
                <span>Visit Mode: <strong className="text-slate-800 uppercase">{completedAppointment.visitType}</strong></span>
                <span>Payable at OPD Desk: <strong className="text-slate-900">${completedAppointment.consultationFee}</strong></span>
              </div>
            </div>

            {/* Arrival Instructions */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <p className="font-bold">Important Patient Guidelines:</p>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                <li>Please arrive at least 15 minutes prior to your scheduled time slot at {completedAppointment.roomNumber}.</li>
                <li>Carry prior medical prescriptions, ECGs, blood test reports, and government photo ID.</li>
                <li>SMS and email confirmation details have been recorded in your patient profile.</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors text-center cursor-pointer"
              >
                Done & View Appointments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
