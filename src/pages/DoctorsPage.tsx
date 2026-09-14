import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Award, 
  Stethoscope,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { DOCTORS, DEPARTMENTS } from '../data/hospitalData';
import { Doctor } from '../types';

interface DoctorsPageProps {
  onOpenBooking: (doctorId?: string, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  onOpenBooking,
  onSelectDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Filter doctors
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesDept = selectedDepartment === 'all' || doc.departmentId === selectedDepartment;
    const matchesExp = doc.experienceYears >= minExperience;
    const matchesLang = selectedLanguage === 'all' || doc.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase());
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specializationAreas.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesDept && matchesExp && matchesLang && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <Stethoscope className="w-4 h-4" />
            <span>Board-Certified Senior Consultants</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Our Specialist Doctors
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Connect with distinguished physicians, surgeons, and department heads committed to delivering the highest standard of personalized medical care.
          </p>

          {/* Search bar inside header */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, or condition (e.g. Martinez, angioplasty, arthritis)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filters Controls Toolbar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span>Filter Specialists Directory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Department Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="all">All Departments ({DEPARTMENTS.length})</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Minimum Experience</label>
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="0">All Experience Levels</option>
                <option value="12">12+ Years Experience</option>
                <option value="15">15+ Years Experience</option>
                <option value="18">18+ Years Senior Faculty</option>
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="all">All Languages</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="hindi">Hindi</option>
                <option value="mandarin">Mandarin</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>

            {/* Reset Action */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('all');
                  setMinExperience(0);
                  setSelectedLanguage('all');
                }}
                className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> of {DOCTORS.length} specialists</span>
          {selectedDepartment !== 'all' && (
            <span className="text-teal-700 font-semibold">
              Department: {DEPARTMENTS.find(d => d.id === selectedDepartment)?.name}
            </span>
          )}
        </div>

        {/* Doctor Cards Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <Stethoscope className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No doctors match your criteria</h3>
            <p className="text-xs text-slate-500">Please reset filters to see all available specialists.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('all');
                setMinExperience(0);
                setSelectedLanguage('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
            >
              Show All Doctors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                id={`doctor-card-${doc.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs group-hover:scale-102 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{doc.name}</h3>
                      <p className="text-xs text-teal-700 font-semibold">{doc.title}</p>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        {doc.departmentName}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Exp Badges */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{doc.rating}</span>
                      <span className="text-slate-400 text-[11px]">({doc.reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doc.experienceYears}+ Years</span>
                    </div>
                    <div className="text-slate-900 font-bold text-xs">
                      ${doc.consultationFee}
                    </div>
                  </div>

                  {/* Qualification & Room */}
                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <p className="font-medium text-slate-800 truncate" title={doc.qualification}>
                      {doc.qualification}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Clinic: {doc.roomNumber}
                    </p>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.specializationAreas.slice(0, 3).map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-medium text-teal-800 border border-teal-100"
                      >
                        {area}
                      </span>
                    ))}
                    {doc.specializationAreas.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{doc.specializationAreas.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Days: {doc.availableDays.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center"
                    >
                      View Profile
                    </button>
                    <button
                      id={`book-doc-btn-${doc.id}`}
                      onClick={() => onOpenBooking(doc.id, doc.departmentId)}
                      className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book OPD</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
