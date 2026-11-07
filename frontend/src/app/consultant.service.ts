import { HttpClient} from '@angular/common/http';
import { inject, Injectable} from '@angular/core';
import { Consultant} from './consultant';
import { BookingRequest, BookingResponse} from './booking';

@Injectable({
  providedIn: 'root',
})
export class ConsultantService{
  private readonly http = inject(HttpClient);

  getConsultants(){
    return this.http.get<Consultant[]>('api/consultants')
  };
  getAvailableSlots(consultantId: number, date: string){
    return this.http.get<string[]>(`api/consultants/${consultantId}/slots?date=${date}`)
  };
  createBooking(booking: BookingRequest){
    return this.http.post<BookingResponse>('api/bookings', booking)
  };
}
