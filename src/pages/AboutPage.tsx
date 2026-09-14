import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Award, 
  Users, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  Activity,
  Stethoscope,
  Microscope
} from 'lucide-react';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface AboutPageProps {
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenBooking }) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Serving Global Communities Since 2004</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            About Gunshika Care
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Where advanced clinical precision meets genuine human compassion. A trusted quaternary care healing institution driven by clinical outcomes and patient trust.
          </p>
        </div>
      </section>

      {/* Heritage & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Our Heritage & Legacy</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Dedicated to Transforming Healthcare For Over Two Decades
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Established with a singular purpose—to make world-class medical science accessible and gentle—Gunshika Care Hospitals has evolved into one of the region’s preeminent healthcare destinations. 
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              With 450 beds, 14 state-of-the-art laminar airflow operating suites, and a multidisciplinary faculty of more than 120 senior physicians, we treat over 35,000 patients annually across all super-specialties.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100">
                <span className="text-2xl font-black text-teal-800">350,000+</span>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Lives touched & healed</p>
              </div>
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-100">
                <span className="text-2xl font-black text-teal-800">45+</span>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Countries represented</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80"
                alt="Gunshika Care Hospitals Modern Campus"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6 text-white">
                <div>
                  <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Main Tertiary Campus</span>
                  <h4 className="text-lg font-bold">Gunshika Care Central Medical District</h4>
                  <p className="text-xs text-slate-300">742 Healthcare Boulevard • 450 Licensed Beds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Core Values */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Guiding Principles</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Our Mission, Vision & Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To deliver compassionate, ethical, and evidence-based clinical care of the highest international caliber, ensuring every patient is treated with dignity, safety, and respect.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To be the benchmark for medical excellence and innovative surgical care across the globe, continually pioneering breakthrough treatments in oncology, cardiology, and neuroscience.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Core Values</h3>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Zero-Compromise Patient Safety</li>
                <li>Clinical Empathy & Transparent Pricing</li>
                <li>Integrity and Highest Ethical Standards</li>
                <li>Continuous Medical Research & Training</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Accreditations & Quality Benchmarks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Rigorous Standards</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Accreditations & Certifications</h2>
          <p className="text-sm text-slate-500 mt-1">Audited and verified by global healthcare quality boards.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOSPITAL_INFO.accreditations.map((acc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{acc.name}</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{acc.detail}</p>
              </div>
              <span className="text-[11px] font-bold text-teal-700 mt-4 block">Certified Quality</span>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership & Medical Governance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Hospital Administration</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Hospital Leadership & Board</h2>
          <p className="text-sm text-slate-500 mt-1">Led by recognized physicians and healthcare pioneers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOSPITAL_INFO.leadership.map((leader, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col"
            >
              <img
                src={leader.image}
                alt={leader.name}
                className="w-full h-64 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{leader.name}</h4>
                  <span className="text-xs font-semibold text-teal-700 block">{leader.role}</span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities & Cutting Edge Technology */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">State-Of-The-Art Equipment</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">World-Class Medical Technology</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
              <Building2 className="w-8 h-8 text-teal-400" />
              <h4 className="text-base font-bold text-white">Da Vinci Robotic Surgical Suite</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                4-arm robotic precision offering tremor-free 3D magnified views, smaller incisions, minimal blood loss, and faster return to work.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
              <Activity className="w-8 h-8 text-teal-400" />
              <h4 className="text-base font-bold text-white">Biplane Cath Lab with 3D Roadmapping</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ultra-fast emergency cardiac interventions with 24/7 coverage, delivering door-to-balloon times under 50 minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
              <Microscope className="w-8 h-8 text-teal-400" />
              <h4 className="text-base font-bold text-white">Automated Pneumatic Molecular Lab</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Next-generation genomic sequencing and rapid pathology providing cancer markers and biopsy confirmations within 24 hours.
              </p>
            </div>
          </div>

          {/* Book banner inside About */}
          <div className="mt-12 text-center pt-8 border-t border-slate-800">
            <button
              onClick={onOpenBooking}
              className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule a Consultation at Gunshika Care</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
