import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import { AppointmentSlipModal } from './components/AppointmentSlipModal';
import { AuthModal } from './components/AuthModal';
import { Page, Doctor, Appointment } from './types';
import { getStoredAppointments } from './utils/storage';
import { CheckCircle2, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { subscribeUserAppointments } from './services/firebaseAppointments';

export default function App() {
  const { currentUser, userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageParam, setPageParam] = useState<string | undefined>(undefined);

  // Appointments in state
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | undefined>(undefined);
  const [bookingDeptId, setBookingDeptId] = useState<string | undefined>(undefined);

  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<Doctor | null>(null);
  const [selectedAppointmentForSlip, setSelectedAppointmentForSlip] = useState<Appointment | null>(null);

  // Authentication Modal state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize appointments strictly per authenticated user session
  useEffect(() => {
    const uid = currentUser?.uid;
    // Load this specific user's cached appointments (or empty guest state if logged out)
    const initialUserAppointments = getStoredAppointments(uid);
    setAppointments(initialUserAppointments);

    if (!uid) {
      return;
    }

    const unsubscribe = subscribeUserAppointments(uid, (firestoreAppts) => {
      setAppointments((prev) => {
        if (!firestoreAppts) return prev;
        // Merge Firestore appointments with local items, strictly for this user
        const map = new Map<string, Appointment>();
        prev.forEach((item) => {
          if (!item.userId || item.userId === uid) {
            map.set(item.bookingReference || item.id, item);
          }
        });
        firestoreAppts.forEach((item) => {
          if (item.userId === uid) {
            map.set(item.bookingReference || item.id, item);
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (page: Page, param?: string) => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (doctorId?: string, departmentId?: string) => {
    setBookingDoctorId(doctorId);
    setBookingDeptId(departmentId);
    setBookingModalOpen(true);
  };

  const handleBookingComplete = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev.filter(p => p.id !== newAppt.id)]);
    showToast(`Appointment confirmed with ${newAppt.doctorName} (Ref: ${newAppt.bookingReference})`);
  };

  const handleAppointmentsChange = (updated: Appointment[]) => {
    setAppointments(updated);
    showToast('Appointments updated successfully.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
        appointmentCount={appointments.filter((a) => a.status === 'confirmed').length}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Page Router */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onSelectDoctor={(doc) => setSelectedDoctorForProfile(doc)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onOpenBooking={() => handleOpenBooking()} />
        )}

        {currentPage === 'departments' && (
          <DepartmentsPage
            initialDepartmentId={pageParam}
            onOpenBooking={handleOpenBooking}
            onSelectDoctor={(doc) => setSelectedDoctorForProfile(doc)}
          />
        )}

        {currentPage === 'doctors' && (
          <DoctorsPage
            onOpenBooking={handleOpenBooking}
            onSelectDoctor={(doc) => setSelectedDoctorForProfile(doc)}
          />
        )}

        {currentPage === 'my-appointments' && (
          <MyAppointmentsPage
            appointments={appointments}
            onAppointmentsChange={handleAppointmentsChange}
            onOpenBooking={() => handleOpenBooking()}
            onViewSlip={(appt) => setSelectedAppointmentForSlip(appt)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPortalPage
            onNavigateHome={() => handleNavigate('home')}
            onViewSlip={(appt) => setSelectedAppointmentForSlip(appt)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenBooking={() => handleOpenBooking()} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          showToast(`Welcome to Gunshika Care Patient Portal!`);
        }}
      />

      {/* Doctor Profile Modal */}
      {selectedDoctorForProfile && (
        <DoctorProfileModal
          doctor={selectedDoctorForProfile}
          onClose={() => setSelectedDoctorForProfile(null)}
          onBookAppointment={(docId, deptId) => {
            setSelectedDoctorForProfile(null);
            handleOpenBooking(docId, deptId);
          }}
        />
      )}

      {/* Appointment Booking Wizard Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDoctorId={bookingDoctorId}
        preselectedDepartmentId={bookingDeptId}
        onBookingComplete={handleBookingComplete}
      />

      {/* Printable OPD Appointment Slip Modal */}
      {selectedAppointmentForSlip && (
        <AppointmentSlipModal
          appointment={selectedAppointmentForSlip}
          onClose={() => setSelectedAppointmentForSlip(null)}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold leading-snug flex-1">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
