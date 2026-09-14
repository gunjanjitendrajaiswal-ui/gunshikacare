import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Appointment } from '../types';

export const saveAppointmentToFirestore = async (appointment: Appointment, userId: string): Promise<void> => {
  const path = `appointments/${appointment.id}`;
  try {
    const apptDocRef = doc(db, 'appointments', appointment.id);
    const appointmentData: Appointment = {
      ...appointment,
      userId
    };
    await setDoc(apptDocRef, appointmentData);
  } catch (error) {
    console.warn(`Firestore save notice for ${path}: continuing with local storage.`, error);
  }
};

export const fetchUserAppointmentsFromFirestore = async (userId: string): Promise<Appointment[]> => {
  const path = 'appointments';
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    querySnapshot.forEach((docSnap) => {
      appointments.push(docSnap.data() as Appointment);
    });

    // Sort descending by date & creation
    appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return appointments;
  } catch (error) {
    console.warn(`Firestore query notice on ${path}: returning local cache fallback.`, error);
    return [];
  }
};

export const updateAppointmentStatusInFirestore = async (
  appointmentId: string, 
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  const path = `appointments/${appointmentId}`;
  try {
    const apptDocRef = doc(db, 'appointments', appointmentId);
    await updateDoc(apptDocRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn(`Firestore status update notice on ${path}: saved locally.`, error);
  }
};

export const subscribeUserAppointments = (
  userId: string,
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: unknown) => void
): (() => void) => {
  const path = 'appointments';
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const appointments: Appointment[] = [];
        querySnapshot.forEach((docSnap) => {
          appointments.push(docSnap.data() as Appointment);
        });
        appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(appointments);
      },
      (error) => {
        console.warn('Firestore onSnapshot listener notice on appointments:', error.message || error);
        if (onError) {
          onError(error);
        }
      }
    );
  } catch (err) {
    console.warn('Could not establish appointments real-time listener:', err);
    return () => {};
  }
};

export const fetchAllAppointmentsFromFirestore = async (): Promise<Appointment[]> => {
  const path = 'appointments';
  try {
    const q = collection(db, 'appointments');
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    querySnapshot.forEach((docSnap) => {
      appointments.push(docSnap.data() as Appointment);
    });

    appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return appointments;
  } catch (error) {
    console.warn(`Firestore query notice on ${path} (admin):`, error);
    return [];
  }
};

export const subscribeAllAppointments = (
  onUpdate: (appointments: Appointment[]) => void,
  onError?: (error: unknown) => void
): (() => void) => {
  try {
    const q = collection(db, 'appointments');
    return onSnapshot(
      q,
      (querySnapshot) => {
        const appointments: Appointment[] = [];
        querySnapshot.forEach((docSnap) => {
          appointments.push(docSnap.data() as Appointment);
        });
        appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(appointments);
      },
      (error) => {
        console.warn('Firestore onSnapshot notice for all appointments:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not establish all appointments real-time listener:', err);
    return () => {};
  }
};

export const adminSaveAppointmentToFirestore = async (appointment: Appointment): Promise<void> => {
  const path = `appointments/${appointment.id}`;
  try {
    const apptDocRef = doc(db, 'appointments', appointment.id);
    await setDoc(apptDocRef, appointment);
  } catch (error) {
    console.warn(`Firestore save notice for ${path}: continuing with local storage.`, error);
  }
};

export const adminDeleteAppointmentFromFirestore = async (appointmentId: string): Promise<void> => {
  const path = `appointments/${appointmentId}`;
  try {
    const apptDocRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(apptDocRef);
  } catch (error) {
    console.warn(`Firestore delete notice for ${path}:`, error);
  }
};

