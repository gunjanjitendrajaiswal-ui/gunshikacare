import React from 'react';
import { 
  X, 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Globe, 
  Award, 
  Stethoscope,
  PhoneCall
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookAppointment: (doctorId: string, departmentId: string) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  onClose,
  onBookAppointment
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <button
          onClick={onClose}
          id="close-doctor-profile-modal-btn"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white/20 shadow-xl shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Senior Consultant</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{doctor.name}</h2>
              <p className="text-teal-200 text-sm font-medium">{doctor.title}</p>
              <p className="text-slate-300 text-xs">{doctor.departmentName}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{doctor.rating}</span>
                  <span className="text-slate-300">({doctor.reviewsCount} patient reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Award className="w-4 h-4 text-teal-300" />
                  <span>{doctor.experienceYears}+ Yrs Clinical Exp.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">Consultation Fee</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">${doctor.consultationFee}</span>
              <span className="text-[11px] text-teal-600 font-medium">Valid for 7 days</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">Clinic Location</span>
              <span className="text-xs font-semibold text-slate-800 mt-1 block truncate">{doctor.roomNumber}</span>
              <span className="text-[11px] text-slate-500">Main Hospital OPD</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 font-medium block">Languages</span>
              <span className="text-xs font-semibold text-slate-800 mt-1 block">{doctor.languages.join(', ')}</span>
              <span className="text-[11px] text-slate-500">Fluent consultation</span>
            </div>
          </div>

          {/* Qualifications & Medical Bio */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Medical Background & Credentials</span>
            </h4>
            <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-100 mb-3 text-xs font-semibold text-teal-900">
              {doctor.qualification}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Clinical Expertise */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2.5">
              Specialized Areas of Focus
            </h4>
            <div className="flex flex-wrap gap-2">
              {doctor.specializationAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* OPD Clinic Schedule */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Available OPD Days</span>
              </span>
              <span className="text-xs font-semibold text-teal-700">
                {doctor.availableDays.join(' • ')}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Typical Time Slots:</span>
              </span>
              <span className="font-medium text-slate-800">
                {doctor.availableTimeSlots.slice(0, 3).join(', ')} ...
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Next available slot: </span>
            <span className="font-semibold text-teal-700">Tomorrow, {doctor.availableTimeSlots[0]}</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              id="modal-book-with-doc-btn"
              onClick={() => {
                onClose();
                onBookAppointment(doctor.id, doctor.departmentId);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment (${doctor.consultationFee})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
