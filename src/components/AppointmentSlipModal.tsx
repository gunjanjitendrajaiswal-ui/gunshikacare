import React from 'react';
import { X, Printer, Heart, CheckCircle2, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { Appointment } from '../types';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface AppointmentSlipModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const AppointmentSlipModal: React.FC<AppointmentSlipModalProps> = ({
  appointment,
  onClose
}) => {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 print:m-0 print:p-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-slip-modal-btn"
          className="print:hidden absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Pass Container */}
        <div id="printable-appointment-slip" className="p-6 sm:p-8 space-y-6">
          {/* Hospital Header */}
          <div className="border-b-2 border-teal-600 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Heart className="w-6 h-6 fill-white text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-none">Gunshika Care</h2>
                <p className="text-[11px] text-teal-700 font-semibold tracking-wider uppercase mt-1">
                  Tertiary Care & Super-Specialty Medical Institute
                </p>
                <p className="text-[10px] text-slate-500">{HOSPITAL_INFO.address}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 inline-block">
                OPD SLIP
              </span>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Ref: {appointment.bookingReference}</p>
            </div>
          </div>

          {/* Status & Barcode strip */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Appointment Status
              </span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmed (Desk Checked)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Format
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase px-2 py-0.5 bg-white rounded border border-slate-200">
                {appointment.visitType} Visit
              </span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Patient Full Name:</span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">{appointment.patientName}</span>
              <span className="text-slate-600">Age / Gender: {appointment.patientAge} yrs / {appointment.patientGender}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Contact Phone:</span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">{appointment.patientPhone}</span>
              <span className="text-slate-600 truncate block">{appointment.patientEmail}</span>
            </div>
          </div>

          {/* Doctor & Schedule Details */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 space-y-3 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-teal-800 font-bold block text-sm">{appointment.doctorName}</span>
                <span className="text-teal-700">{appointment.doctorTitle}</span>
                <span className="text-slate-600 block mt-0.5">{appointment.departmentName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Clinic OPD Desk:</span>
                <span className="font-bold text-slate-900 block text-xs bg-white px-2 py-1 rounded border border-teal-200 mt-0.5">
                  {appointment.roomNumber}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-teal-100/80 flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Date: <strong>{appointment.date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>Time Slot: <strong>{appointment.timeSlot}</strong></span>
              </div>
              <div>
                <span>Fee: <strong>${appointment.consultationFee}</strong></span>
              </div>
            </div>
          </div>

          {/* Symptoms note */}
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Chief Reason for Consultation: </span>
            <span>{appointment.symptoms}</span>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p>• Please report to {appointment.roomNumber} 15 minutes before your consultation.</p>
            <p>• In case of rescheduling or emergency, call central desk at {HOSPITAL_INFO.generalInquiryPhone}.</p>
          </div>
        </div>

        {/* Modal Buttons (Hidden in print) */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            id="print-appointment-slip-btn"
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Appointment Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
