import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Consultant } from './consultant';
import { BookingRequest, BookingResponse } from './booking';

@Injectable({
  providedIn: 'root',
})
export class ConsultantService {
  private readonly http = inject(HttpClient);

  createConsultantsResource() {
    return httpResource<Consultant[]>(() => '/api/consultants');
  }

  createBookingsResource() {
    return httpResource<BookingResponse[]>(() => '/api/bookings');
  }

  createSlotsResource(
    consultant: () => Consultant | null,
    date: () => string,
    slotsRequested: () => boolean,
  ) {
    return httpResource<string[]>(() => {
      const selectedConsultant = consultant();
      const selectedDate = date();

      if (!slotsRequested() || selectedConsultant === null || selectedDate === '') {
        return undefined;
      }

      return `/api/consultants/${selectedConsultant.id}/slots?date=${selectedDate}`;
    });
  }

  createBooking(booking: BookingRequest) {
    return this.http.post<BookingResponse>('/api/bookings', booking);
  }
}
