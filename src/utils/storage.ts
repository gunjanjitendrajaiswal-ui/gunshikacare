import { Appointment } from '../types';

const APPOINTMENTS_STORAGE_PREFIX = 'gunshikacare_appointments_user_';
const GUEST_STORAGE_KEY = 'gunshikacare_appointments_guest_v1';
const LEGACY_STORAGE_KEY = 'gunshikacare_appointments_v1';
const MASTER_ALL_APPOINTMENTS_KEY = 'gunshikacare_all_appointments_master_v1';

const getStorageKey = (userId?: string): string => {
  if (userId && userId.trim()) {
    return `${APPOINTMENTS_STORAGE_PREFIX}${userId.trim()}`;
  }
  return GUEST_STORAGE_KEY;
};

// Realistic initial hospital sample bookings for admin oversight
const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'admin-demo-1',
    userId: 'user-sample-sarah',
    bookingReference: 'GSC-8821',
    patientName: 'Sarah Jenkins',
    patientPhone: '+1 (555) 234-8901',
    patientEmail: 'sarah.j@example.com',
    patientAge: 34,
    patientGender: 'female',
    isFirstVisit: false,
    departmentId: 'cardiology',
    departmentName: 'Cardiology & Heart Center',
    doctorId: 'doc-cardio-1',
    doctorName: 'Dr. Evelyn Martinez',
    doctorTitle: 'Chief Interventional Cardiologist & Director',
    visitType: 'in-person',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlot: '10:00 AM',
    symptoms: 'Routine cardiovascular checkup and echocardiogram review',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    consultationFee: 120,
    roomNumber: 'Suite 201 - Heart Wing'
  },
  {
    id: 'admin-demo-2',
    userId: 'user-sample-david',
    bookingReference: 'GSC-9430',
    patientName: 'David Miller',
    patientPhone: '+1 (555) 872-1109',
    patientEmail: 'david.m@example.com',
    patientAge: 52,
    patientGender: 'male',
    isFirstVisit: true,
    departmentId: 'orthopedics',
    departmentName: 'Orthopedics & Joint Replacement',
    doctorId: 'doc-ortho-1',
    doctorName: 'Dr. Robert Chen',
    doctorTitle: 'Head of Orthopedic Surgery & Joint Reconstruction',
    visitType: 'in-person',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // In 2 days
    timeSlot: '11:30 AM',
    symptoms: 'Persistent right knee pain after physical activity, stiffness in mornings',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    consultationFee: 140,
    roomNumber: 'Suite 305 - Bone & Joint Pavilion'
  },
  {
    id: 'admin-demo-3',
    userId: 'user-sample-elena',
    bookingReference: 'GSC-6112',
    patientName: 'Elena Rostova',
    patientPhone: '+1 (555) 431-7782',
    patientEmail: 'elena.rostova@example.com',
    patientAge: 29,
    patientGender: 'female',
    isFirstVisit: false,
    departmentId: 'neurology',
    departmentName: 'Neurology & Stroke Center',
    doctorId: 'doc-neuro-1',
    doctorName: 'Dr. Alistair Vance',
    doctorTitle: 'Director of Comprehensive Stroke & Epilepsy Center',
    visitType: 'video',
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: '02:30 PM',
    symptoms: 'Telehealth follow-up on migraine management protocol and medication titration',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    consultationFee: 160,
    roomNumber: 'Suite 410 - Neuro Center'
  }
];

export const getStoredAppointments = (userId?: string): Appointment[] => {
  try {
    const key = getStorageKey(userId);
    let raw = localStorage.getItem(key);

    // If specific user has no records yet, check if legacy storage contains any records specifically matching this user
    if (!raw && userId) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            const userOnly = parsed.filter((item: Appointment) => item.userId === userId);
            if (userOnly.length > 0) {
              localStorage.setItem(key, JSON.stringify(userOnly));
              return userOnly;
            }
          }
        } catch {
          // ignore legacy parse errors
        }
      }
      return [];
    }

    // If guest user and nothing stored yet
    if (!raw && !userId) {
      return [];
    }

    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load appointments from localStorage', error);
    return [];
  }
};

// Retrieve all appointments for the Admin portal
export const getAllStoredAppointments = (): Appointment[] => {
  try {
    const map = new Map<string, Appointment>();

    // 1. Seed demo appointments if master key doesn't exist
    const masterRaw = localStorage.getItem(MASTER_ALL_APPOINTMENTS_KEY);
    if (!masterRaw) {
      localStorage.setItem(MASTER_ALL_APPOINTMENTS_KEY, JSON.stringify(INITIAL_DEMO_APPOINTMENTS));
      INITIAL_DEMO_APPOINTMENTS.forEach((appt) => map.set(appt.bookingReference || appt.id, appt));
    } else {
      try {
        const parsedMaster = JSON.parse(masterRaw);
        if (Array.isArray(parsedMaster)) {
          parsedMaster.forEach((appt: Appointment) => map.set(appt.bookingReference || appt.id, appt));
        }
      } catch (err) {
        console.warn('Error reading master appointments:', err);
      }
    }

    // 2. Scan all localStorage keys for user appointments and merge
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(APPOINTMENTS_STORAGE_PREFIX) ||
          key === GUEST_STORAGE_KEY ||
          key === LEGACY_STORAGE_KEY)
      ) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((appt: Appointment) => {
                if (appt && (appt.id || appt.bookingReference)) {
                  map.set(appt.bookingReference || appt.id, appt);
                }
              });
            }
          } catch {
            // Ignore parse errors on corrupted keys
          }
        }
      }
    }

    const all = Array.from(map.values());
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  } catch (error) {
    console.error('Failed to load all appointments for admin:', error);
    return INITIAL_DEMO_APPOINTMENTS;
  }
};

export const saveAppointment = (appointment: Appointment, userId?: string): void => {
  try {
    const effectiveUserId = userId || appointment.userId;
    const key = getStorageKey(effectiveUserId);
    const existing = getStoredAppointments(effectiveUserId);
    
    // Check if item with same ID or bookingReference already exists
    const fullAppt: Appointment = {
      ...appointment,
      userId: effectiveUserId || appointment.userId
    };

    const updated = [
      fullAppt,
      ...existing.filter(a => a.id !== appointment.id && a.bookingReference !== appointment.bookingReference)
    ];
    
    localStorage.setItem(key, JSON.stringify(updated));

    // Also mirror to Master All-Appointments repository for Admin portal visibility
    const masterAppts = getAllStoredAppointments();
    const updatedMaster = [
      fullAppt,
      ...masterAppts.filter(a => a.id !== appointment.id && a.bookingReference !== appointment.bookingReference)
    ];
    localStorage.setItem(MASTER_ALL_APPOINTMENTS_KEY, JSON.stringify(updatedMaster));
  } catch (error) {
    console.error('Failed to save appointment to localStorage', error);
  }
};

export const updateAppointmentStatus = (
  id: string, 
  status: 'confirmed' | 'cancelled' | 'completed',
  userId?: string
): Appointment[] => {
  try {
    const key = getStorageKey(userId);
    const appointments = getStoredAppointments(userId);
    const updated = appointments.map(appt => appt.id === id ? { ...appt, status } : appt);
    localStorage.setItem(key, JSON.stringify(updated));

    // Mirror status update in master list as well
    const masterAppts = getAllStoredAppointments();
    const updatedMaster = masterAppts.map(appt => appt.id === id ? { ...appt, status } : appt);
    localStorage.setItem(MASTER_ALL_APPOINTMENTS_KEY, JSON.stringify(updatedMaster));

    return updated;
  } catch (error) {
    console.error('Failed to update appointment status', error);
    return [];
  }
};

// Admin: Save or add an appointment directly from the Admin Desk
export const adminSaveAppointment = (appointment: Appointment): Appointment[] => {
  try {
    const masterAppts = getAllStoredAppointments();
    const updatedMaster = [
      appointment,
      ...masterAppts.filter(a => a.id !== appointment.id && a.bookingReference !== appointment.bookingReference)
    ];
    localStorage.setItem(MASTER_ALL_APPOINTMENTS_KEY, JSON.stringify(updatedMaster));

    // Also sync to target patient's user bucket if userId is present
    if (appointment.userId) {
      const userAppts = getStoredAppointments(appointment.userId);
      const updatedUser = [
        appointment,
        ...userAppts.filter(a => a.id !== appointment.id && a.bookingReference !== appointment.bookingReference)
      ];
      localStorage.setItem(getStorageKey(appointment.userId), JSON.stringify(updatedUser));
    }

    return updatedMaster;
  } catch (error) {
    console.error('Admin save appointment failed in localStorage:', error);
    return [];
  }
};

// Admin: Update status of any booking
export const adminUpdateAppointmentStatus = (
  id: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Appointment[] => {
  try {
    const masterAppts = getAllStoredAppointments();
    let targetUserId: string | undefined;

    const updatedMaster = masterAppts.map(appt => {
      if (appt.id === id || appt.bookingReference === id) {
        targetUserId = appt.userId;
        return { ...appt, status };
      }
      return appt;
    });
    localStorage.setItem(MASTER_ALL_APPOINTMENTS_KEY, JSON.stringify(updatedMaster));

    // Also update target user's local bucket if matched
    if (targetUserId) {
      const userKey = getStorageKey(targetUserId);
      const userAppts = getStoredAppointments(targetUserId);
      const updatedUser = userAppts.map(appt => (appt.id === id || appt.bookingReference === id) ? { ...appt, status } : appt);
      localStorage.setItem(userKey, JSON.stringify(updatedUser));
    }

    return updatedMaster;
  } catch (error) {
    console.error('Admin update status failed in localStorage:', error);
    return [];
  }
};

// Admin: Delete appointment
export const adminDeleteAppointment = (id: string): Appointment[] => {
  try {
    const masterAppts = getAllStoredAppointments();
    let targetUserId: string | undefined;

    const updatedMaster = masterAppts.filter(appt => {
      if (appt.id === id || appt.bookingReference === id) {
        targetUserId = appt.userId;
        return false;
      }
      return true;
    });
    localStorage.setItem(MASTER_ALL_APPOINTMENTS_KEY, JSON.stringify(updatedMaster));

    if (targetUserId) {
      const userKey = getStorageKey(targetUserId);
      const userAppts = getStoredAppointments(targetUserId);
      const updatedUser = userAppts.filter(appt => appt.id !== id && appt.bookingReference !== id);
      localStorage.setItem(userKey, JSON.stringify(updatedUser));
    }

    return updatedMaster;
  } catch (error) {
    console.error('Admin delete appointment failed:', error);
    return [];
  }
};

export const clearUserLocalData = (userId?: string): void => {
  try {
    if (userId) {
      localStorage.removeItem(getStorageKey(userId));
    }
  } catch (err) {
    console.warn('Error clearing user data:', err);
  }
};

export const generateBookingReference = (): string => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `GSC-${randomDigits}`;
};

