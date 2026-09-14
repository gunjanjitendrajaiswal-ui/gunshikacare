import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Star, 
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Building2,
  Sparkles
} from 'lucide-react';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { Department, Doctor } from '../types';

interface DepartmentsPageProps {
  initialDepartmentId?: string;
  onOpenBooking: (doctorId?: string, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  initialDepartmentId,
  onOpenBooking,
  onSelectDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId || 'all');
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(initialDepartmentId || DEPARTMENTS[0].id);

  // Filter departments based on search or selected filter
  const filteredDepartments = DEPARTMENTS.filter((dept) => {
    const matchesFilter = selectedDeptId === 'all' || dept.id === selectedDeptId;
    const matchesSearch = !searchQuery ||
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.commonConditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dept.keyProcedures.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <Building2 className="w-4 h-4" />
            <span>Comprehensive Clinical Excellence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Clinical Departments & Institutes
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Every department at Gunshika Care operates with dedicated specialist physicians, sub-specialty clinics, and dedicated surgical infrastructure.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search department, procedure, or condition (e.g. bypass, stroke, joint, chemo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Quick Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Departments ({DEPARTMENTS.length})
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDeptId === dept.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Departments List */}
        <div className="space-y-8">
          {filteredDepartments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
              <Stethoscope className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No departments match your search</h3>
              <p className="text-xs text-slate-500">Try adjusting keywords or selecting "All Departments".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDeptId('all');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredDepartments.map((dept) => {
              const deptDoctors = DOCTORS.filter((doc) => doc.departmentId === dept.id);
              const isExpanded = expandedDeptId === dept.id;

              return (
                <div
                  key={dept.id}
                  id={`dept-card-${dept.id}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Top Bar of Department Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
                    {/* Image & Key Stats */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="relative rounded-xl overflow-hidden h-52 shadow-xs">
                        <img
                          src={dept.imageUrl}
                          alt={dept.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                          <span className="text-xs font-bold text-teal-300">{dept.stats}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-500 block font-medium">Head of Department:</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">{dept.headOfDepartment}</span>
                      </div>
                    </div>

                    {/* Department Core Info */}
                    <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">{dept.name}</h2>
                          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                            {deptDoctors.length} Specialized Doctors
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                          {dept.fullDescription}
                        </p>

                        {/* Common Conditions Treated */}
                        <div className="mb-4">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                            Conditions Commonly Treated:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.commonConditions.map((cond, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {cond}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Procedures */}
                        <div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                            Key Advanced Procedures:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                            {dept.keyProcedures.slice(0, 4).map((proc, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span>{proc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Department Actions */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Faculty Doctors' : `View Faculty Doctors (${deptDoctors.length})`}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => onOpenBooking(undefined, dept.id)}
                          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book {dept.name} Consultation</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Faculty Doctors in this Department */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-6 sm:p-8 animate-in slide-in-from-top-2 duration-200">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span>Specialist Doctors in {dept.name}</span>
                        </h4>
                        <span className="text-xs text-slate-500">Each doctor accepts online appointment bookings</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deptDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <img
                                  src={doc.imageUrl}
                                  alt={doc.name}
                                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                                  <p className="text-xs text-teal-700 font-medium leading-tight">{doc.title}</p>
                                  <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-slate-800">{doc.rating}</span>
                                    <span>• {doc.experienceYears}+ yrs exp</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                                {doc.bio}
                              </p>

                              <div className="text-[11px] text-slate-500 space-y-1 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <div className="flex justify-between">
                                  <span>Fee:</span>
                                  <strong className="text-slate-800">${doc.consultationFee}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Days:</span>
                                  <span className="font-medium">{doc.availableDays.slice(0, 3).join(', ')}...</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => onSelectDoctor(doc)}
                                className="flex-1 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                              >
                                Profile
                              </button>
                              <button
                                onClick={() => onOpenBooking(doc.id, doc.departmentId)}
                                className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer text-center"
                              >
                                Book Slot
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
