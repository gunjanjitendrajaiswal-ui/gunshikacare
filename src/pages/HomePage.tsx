import React, { useState } from 'react';
import { 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Star, 
  Award, 
  ArrowRight, 
  Phone, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Stethoscope, 
  Activity,
  Ambulance,
  Search,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { HOSPITAL_INFO, DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { Page, Doctor } from '../types';

interface HomePageProps {
  onNavigate: (page: Page, param?: string) => void;
  onOpenBooking: (doctorId?: string, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenBooking,
  onSelectDoctor
}) => {
  // Quick Search state in hero
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const filteredQuickDoctors = DOCTORS.filter((doc) => {
    const matchesSpec = selectedSpecialty === 'all' || doc.departmentId === selectedSpecialty;
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specializationAreas.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpec && matchesSearch;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white pt-10 sm:pt-16 pb-20 sm:pb-28 overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Premier JCI & NABH Accredited Multi-Specialty Hospital</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-white">
                World-Class Healthcare. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-cyan-300">
                  Compassionate Hands.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                At Gunshika Care Hospitals, over 120+ internationally renowned surgeons and specialists deliver state-of-the-art medical treatments with sub-millimeter robotic precision and unwavering patient empathy.
              </p>

              {/* Quick Hero Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-book-appointment-btn"
                  onClick={() => onOpenBooking()}
                  className="px-7 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Doctor Appointment</span>
                </button>

                <button
                  id="hero-find-doctors-btn"
                  onClick={() => onNavigate('doctors')}
                  className="px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Stethoscope className="w-5 h-5 text-teal-400" />
                  <span>Explore Doctors ({DOCTORS.length})</span>
                </button>

                <a
                  href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors py-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>24/7 Emergency Line: {HOSPITAL_INFO.emergencyPhone}</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Zero Waiting Door-to-Cath Lab &lt; 50 Mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-400" />
                  <span>99.2% Clinical Success Benchmark</span>
                </div>
              </div>
            </div>

            {/* Right Hero: Quick Appointment Launcher Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-900 border border-white/40">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Find Doctor & Book OPD</h3>
                    <p className="text-xs text-slate-500">Direct booking across 8 specialized institutes</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                      Select Department
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="all">All Clinical Departments ({DEPARTMENTS.length})</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                      Doctor Name or Health Concern
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Dr. Martinez, knee pain, cardiology..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick matches list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Available Doctors ({filteredQuickDoctors.length})
                    </span>
                    {filteredQuickDoctors.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={doc.imageUrl}
                            alt={doc.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h5>
                            <span className="text-[11px] text-teal-700 block truncate">{doc.departmentName}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenBooking(doc.id, doc.departmentId)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          Book Slot
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (filteredQuickDoctors.length > 0) {
                        onOpenBooking(filteredQuickDoctors[0].id, filteredQuickDoctors[0].departmentId);
                      } else {
                        onOpenBooking();
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Instant OPD Appointment Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HOSPITAL_INFO.stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200/70 flex flex-col justify-between hover:shadow-2xl transition-shadow"
            >
              <div>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </span>
                <h4 className="text-sm font-bold text-teal-700 mt-1">{stat.label}</h4>
              </div>
              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE HEALTHCARE SERVICES TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Dedicated Care Wings</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">24/7 Patient Services & Advanced Facilities</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Ambulance className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">24/7 Level 1 Emergency</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Dedicated trauma care with immediate triage, on-site diagnostics, 24/7 blood bank, and emergency operating theaters.
            </p>
            <a href={`tel:${HOSPITAL_INFO.emergencyPhone}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline mt-4">
              <span>Helpline: {HOSPITAL_INFO.emergencyPhone}</span>
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Specialist OPD Clinics</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Daily outpatient consultations across all specialties with guaranteed time slots and zero crowded waiting lines.
            </p>
            <button onClick={() => onOpenBooking()} className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline mt-4 cursor-pointer">
              <span>Book an OPD Visit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Advanced 85-Bed ICU</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Medical, Cardiac (CICU), Neuro, and Level III Neonatal intensive care units managed by certified critical care intensivists.
            </p>
            <button onClick={() => onNavigate('about')} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:underline mt-4 cursor-pointer">
              <span>View Critical Care</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3T MRI & High-End Imaging</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ultra-low radiation Dual-Source CT, 3 Tesla silent MRI, digital mammography, and NABL-certified robotic pathology labs.
            </p>
            <button onClick={() => onNavigate('departments')} className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline mt-4 cursor-pointer">
              <span>Explore Facilities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CLINICAL DEPARTMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Centers of Excellence</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Specialized Medical Departments</h2>
            <p className="text-sm text-slate-500 mt-1">Each department houses multi-specialist faculty and dedicated operating theatres.</p>
          </div>
          <button
            onClick={() => onNavigate('departments')}
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            <span>View All Departments ({DEPARTMENTS.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPARTMENTS.slice(0, 4).map((dept) => {
            const doctorsCount = DOCTORS.filter(d => d.departmentId === dept.id).length;
            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={dept.imageUrl}
                      alt={dept.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider">{dept.stats}</span>
                      <h3 className="text-base font-bold leading-snug">{dept.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {dept.shortDescription}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Specialists:</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {doctorsCount} Doctors Available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('departments', dept.id)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onOpenBooking(undefined, dept.id)}
                    className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center transition-colors shadow-xs cursor-pointer"
                  >
                    Book OPD
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MEET OUR FEATURED SPECIALISTS SPOTLIGHT */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Senior Faculty & Surgeons</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Consult With Our Specialist Doctors</h2>
              <p className="text-sm text-slate-500 mt-1">All specialists maintain board certification, international fellowships, and proven clinical safety track records.</p>
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              <span>Browse All {DOCTORS.length} Specialists</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOCTORS.slice(0, 6).map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-base">{doc.name}</span>
                      </div>
                      <p className="text-xs text-teal-700 font-semibold">{doc.title}</p>
                      <p className="text-[11px] text-slate-500">{doc.departmentName}</p>
                      <div className="flex items-center gap-1 pt-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{doc.rating}</span>
                        <span className="text-slate-400 text-[11px]">({doc.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {doc.bio}
                  </p>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience:</span>
                      <span className="font-semibold">{doc.experienceYears}+ Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <span className="font-bold text-teal-800">${doc.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Days:</span>
                      <span className="font-medium text-slate-800">{doc.availableDays.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onOpenBooking(doc.id, doc.departmentId)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book OPD</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VERIFIED PATIENT STORIES & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Patient Voices</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Compassionate Care That Transforms Lives</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOSPITAL_INFO.testimonials.map((test) => (
            <div
              key={test.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                  "{test.quote}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">{test.patientName}</h4>
                <p className="text-xs text-teal-700 font-medium">{test.procedure} • {test.department}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Treated by: {test.doctor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
