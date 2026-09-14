import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  Building2, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Appointment, VisitType } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { generateBookingReference, adminSaveAppointment } from '../utils/storage';
import { adminSaveAppointmentToFirestore } from '../services/firebaseAppointments';

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (newAppointment: Appointment) => void;
}

export const AdminBookingModal: React.FC<AdminBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(35);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  const [selectedDeptId, setSelectedDeptId] = useState(DEPARTMENTS[0]?.id || 'cardiology');
  const availableDoctors = DOCTORS.filter(d => d.departmentId === selectedDeptId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(availableDoctors[0]?.id || DOCTORS[0]?.id);
  
  const currentDoctor = DOCTORS.find(d => d.id === selectedDoctorId) || availableDoctors[0] || DOCTORS[0];
  
  // Date default tomorrow
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState(tomorrowStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(currentDoctor?.availableTimeSlots[0] || '10:00 AM');
  const [visitType, setVisitType] = useState<VisitType>('in-person');
  const [symptoms, setSymptoms] = useState('');
  const [customFee, setCustomFee] = useState<number>(currentDoctor?.consultationFee || 120);
  const [customRoom, setCustomRoom] = useState<string>(currentDoctor?.roomNumber || 'Room 101');
  const [status, setStatus] = useState<'confirmed' | 'completed' | 'cancelled'>('confirmed');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When department changes, pick first doctor in that department
  useEffect(() => {
    const docsInDept = DOCTORS.filter(d => d.departmentId === selectedDeptId);
    if (docsInDept.length > 0) {
      setSelectedDoctorId(docsInDept[0].id);
      setCustomFee(docsInDept[0].consultationFee);
      setCustomRoom(docsInDept[0].roomNumber);
      setSelectedTimeSlot(docsInDept[0].availableTimeSlots[0] || '10:00 AM');
    }
  }, [selectedDeptId]);

  // When doctor changes, update fee, room, and default slot
  useEffect(() => {
    if (currentDoctor) {
      setCustomFee(currentDoctor.consultationFee);
      setCustomRoom(currentDoctor.roomNumber);
      if (!currentDoctor.availableTimeSlots.includes(selectedTimeSlot)) {
        setSelectedTimeSlot(currentDoctor.availableTimeSlots[0] || '10:00 AM');
      }
    }
  }, [selectedDoctorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName.trim()) {
      setError('Please enter patient full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setError('Please enter patient contact number.');
      return;
    }
    if (!appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }
    if (!selectedTimeSlot) {
      setError('Please select a consultation time slot.');
      return;
    }

    setSaving(true);
    try {
      const selectedDept = DEPARTMENTS.find(d => d.id === selectedDeptId);
      const bookingRef = generateBookingReference();
      const newAppt: Appointment = {
        id: `admin-booking-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: `admin-created`,
        bookingReference: bookingRef,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || `${patientName.toLowerCase().replace(/\s+/g, '')}@patient.gunshikacare.org`,
        patientAge: Number(patientAge) || 30,
        patientGender,
        isFirstVisit,
        departmentId: selectedDeptId,
        departmentName: selectedDept?.name || 'General Medicine',
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorTitle: currentDoctor.title,
        visitType,
        date: appointmentDate,
        timeSlot: selectedTimeSlot,
        symptoms: symptoms.trim() || 'General clinical consultation / OPD walk-in',
        status,
        createdAt: new Date().toISOString(),
        consultationFee: customFee || currentDoctor.consultationFee,
        roomNumber: customRoom || currentDoctor.roomNumber
      };

      // Save in master storage
      adminSaveAppointment(newAppt);

      // Attempt cloud sync to Firestore
      try {
        await adminSaveAppointmentToFirestore(newAppt);
      } catch (cloudErr) {
        console.warn('Firestore cloud sync notice: saved locally.', cloudErr);
      }

      onBookingCreated(newAppt);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/30 text-teal-200 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-400/20 uppercase tracking-wider">
                Admin Reception Desk
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-300" />
              Book New Patient Appointment
            </h2>
            <p className="text-xs text-teal-100/90 mt-0.5">
              Direct registration and OPD scheduling on behalf of walk-in or phone patients.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Patient Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              1. Patient Demographics & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="first-visit-check"
                checked={isFirstVisit}
                onChange={(e) => setIsFirstVisit(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="first-visit-check" className="text-xs text-slate-700 cursor-pointer font-medium">
                First-Time Hospital OPD Visit (New Patient Chart Creation)
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              2. Department & Doctor Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consulting Specialist
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {availableDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — ${doc.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Doctor Info Card Preview */}
            {currentDoctor && (
              <div className="mt-3 p-3 bg-teal-50/60 border border-teal-200/70 rounded-xl flex items-center gap-3">
                <img
                  src={currentDoctor.imageUrl}
                  alt={currentDoctor.name}
                  className="w-12 h-12 rounded-full object-cover border border-teal-300 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{currentDoctor.name}</p>
                  <p className="text-slate-600 text-[11px]">{currentDoctor.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 text-teal-700 font-semibold">
                      <DollarSign className="w-3 h-3" /> Standard Fee: ${currentDoctor.consultationFee}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {currentDoctor.roomNumber}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Schedule & Slot */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              3. Date, Time & Consultation Type
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Slot <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {currentDoctor?.availableTimeSlots?.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visit Mode
                </label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as VisitType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="in-person">In-Person OPD Clinic</option>
                  <option value="video">Telehealth Video</option>
                  <option value="urgent">Urgent Priority OPD</option>
                </select>
              </div>
            </div>

            {/* Custom fee, room, initial status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Fee ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="0"
                    value={customFee}
                    onChange={(e) => setCustomFee(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  OPD Room / Clinic Suite
                </label>
                <input
                  type="text"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Booking Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed (Walk-in already seen)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Symptoms / Clinical reason */}
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Reason / Symptoms / Triage Notes
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Chief complaints, known allergies, or admin notes..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
