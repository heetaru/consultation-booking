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
    );
  };


  createBooking(
    booking: BookingRequest
  ){
    return this.http.post<BookingResponse>('api/bookings', booking);
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

  createBookingResource(
    consultantId: () => number | null,
  ){
    return httpResource<BookingResponse[]>(
      () => {
        const currentId = consultantId();
        if (currentId === null){
          return '/api/bookings'
        }
        return `/api/bookings?consultantId=${currentId}`
      }
    );
  }

  createBookingSearchResource(id: () => number | null){
    return httpResource<BookingResponse>(
      () => {
        const currentId = id();
        if (currentId === null){
          return undefined;
        }
        return `/api/bookings/${currentId}`
      }
    );
  }

  cancelBooking(id: number){
    return this.http.delete<void>(`/api/bookings/${id}`);
  }
}
