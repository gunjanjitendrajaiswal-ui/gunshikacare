import React from 'react';
import { 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  Ambulance
} from 'lucide-react';
import { HOSPITAL_INFO, DEPARTMENTS } from '../data/hospitalData';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page, param?: string) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Emergency CTA Strip inside footer */}
        <div className="bg-gradient-to-r from-teal-900/90 to-slate-800/90 border border-teal-500/30 rounded-2xl p-6 sm:p-8 mb-16 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Ambulance className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">Emergency Care 24/7/365</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Need Immediate Emergency or Cardiac Assistance?</h3>
              <p className="text-sm text-slate-300 mt-1">Our Level 1 Trauma Care & Rapid Cath Lab Team is ready 24 hours a day.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
              id="footer-emergency-call-btn"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call {HOSPITAL_INFO.emergencyPhone}</span>
            </a>
            <button
              onClick={onOpenBooking}
              id="footer-quick-book-btn"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Schedule OPD Visit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: About & Accreditations */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-white text-teal-500" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Gunshika<span className="text-teal-400"> Care</span> <span className="text-slate-400 font-light text-xl">Hospitals</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Gunshika Care Hospitals is a premier 450-bed tertiary care healthcare institution dedicated to delivering world-class medical excellence with compassionate, patient-centered care.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-teal-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Accredited by Joint Commission International (JCI Gold Seal)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-400">
                <Award className="w-4 h-4 shrink-0" />
                <span>NABH Certified & NABL Accredited Diagnostics</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">General OPD Visiting Hours:</p>
              <p>{HOSPITAL_INFO.visitingHours.general}</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-teal-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-teal-400 transition-colors">
                  About Gunshika Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('departments')} className="hover:text-teal-400 transition-colors">
                  Clinical Departments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  Find a Doctor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-appointments')} className="hover:text-teal-400 transition-colors">
                  Manage Appointments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin & Staff Portal</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenBooking} className="text-slate-300 hover:text-white hover:underline font-medium">
                  Book Online OPD
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Departments */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Key Centers</h4>
            <ul className="space-y-2.5 text-sm">
              {DEPARTMENTS.slice(0, 6).map(dept => (
                <li key={dept.id}>
                  <button 
                    onClick={() => onNavigate('departments', dept.id)}
                    className="hover:text-teal-400 transition-colors text-left truncate max-w-[200px]"
                  >
                    {dept.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Help */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact & Support</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-400 leading-relaxed">
                  {HOSPITAL_INFO.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">
                  {HOSPITAL_INFO.generalInquiryPhone}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  {HOSPITAL_INFO.email}
                </span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-slate-400">
                  Casualty & Emergency: 24/7
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Gunshika Care Hospitals Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Patient Bill of Rights</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Cashless Insurance TPA</span>
            <span className="hover:text-slate-400 cursor-pointer">Biomedical Waste Report</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
