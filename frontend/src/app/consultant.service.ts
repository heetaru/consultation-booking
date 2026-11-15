import { HttpClient, httpResource} from '@angular/common/http';
import { inject, Injectable} from '@angular/core';
import { Consultant} from './consultant';
import { BookingRequest, BookingResponse} from './booking';

@Injectable({
  providedIn: 'root',
})
export class ConsultantService{
  private readonly http = inject(HttpClient);


  createConsultantsResource(){
    return httpResource<Consultant[]>(
      () => '/api/consultants'
    )
  };


  getAvailableSlots(
    consultantId: number,
    date: string
  ){
    return this.http.get<string[]>(`api/consultants/${consultantId}/slots?date=${date}`)
  };


  createBooking(
    booking: BookingRequest
  ){
    return this.http.post<BookingResponse>('api/bookings', booking)
  };


  createSlotsResource(
    consultant: () => Consultant | null,
    date: () => string,
    requested: () => boolean,
  ) {
    return httpResource<string[]>(() => {
      const currentConsultant = consultant();
      const currentDate = date();

      if (currentConsultant === null || currentDate === '' || requested() === false){return undefined;}

      return `/api/consultants/${currentConsultant.id}/slots?date=${currentDate}`
    });
  }
}
