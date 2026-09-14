export type Page = 'home' | 'about' | 'departments' | 'doctors' | 'my-appointments' | 'admin';

export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  consultationFee: number;
  languages: string[];
  availableDays: string[];
  availableTimeSlots: string[];
  imageUrl: string;
  bio: string;
  roomNumber: string;
  specializationAreas: string[];
}

export interface Department {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  color: string;
  stats: string;
  headOfDepartment: string;
  keyProcedures: string[];
  commonConditions: string[];
  imageUrl: string;
}

export type VisitType = 'in-person' | 'video' | 'urgent';

export interface Appointment {
  id: string;
  userId?: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  isFirstVisit: boolean;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  visitType: VisitType;
  date: string;
  timeSlot: string;
  symptoms: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  consultationFee: number;
  roomNumber: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt?: string;
}
