'use client';

import { apiRequest } from './apiClient';

export type BookingStatus = 'new' | 'contacted' | 'closed';

export interface Booking {
  id: string;
  // Contact
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  // Project
  project_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  tech_stack: string | null;
  team_size: string | null;
  has_design: string | null;
  // Request
  preferred_datetime: string | null;
  how_heard: string | null;
  message: string | null;
  // Meta
  status: BookingStatus;
  created_at: string;
}

export async function fetchBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>('/bookings');
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  return apiRequest<void>(`/bookings/${id}`, { method: 'DELETE' });
}
