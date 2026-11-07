import {Component, signal, OnInit, inject} from '@angular/core';
import {ConsultantService} from './consultant.service';
import {Consultant} from './consultant';
import {BookingRequest, BookingResponse} from './booking';


@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit{
  private readonly consultantService = inject(ConsultantService);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly consultants = signal<Consultant[]>([]);
  protected readonly selectedConsultant = signal<Consultant | null>(null);
  protected readonly selectedDate = signal('');

  protected readonly selectedSlot = signal('');
  protected readonly bookingInProgress = signal(false);
  protected readonly bookingMessage = signal('');
  protected readonly bookingError = signal('');

  protected readonly slots = signal<string[]>([]);
  protected readonly loadingSlots = signal(false);
  protected readonly slotsLoaded = signal(false);
  protected readonly slotsError = signal('');



  ngOnInit(): void {
    this.consultantService.getConsultants().subscribe({
      next: (consultants) => {
        this.consultants.set(consultants);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not export consultants')
      }
    })
  }
  protected selectConsultant(consultant: Consultant):void{
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedConsultant.set(consultant);
    this.slots.set([]);
    this.slotsLoaded.set(false);
    this.slotsError.set('');
    this.selectedSlot.set('');
  }
  protected selectDate(date: string):void{
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedDate.set(date);
    this.slots.set([]);
    this.slotsLoaded.set(false);
    this.slotsError.set('');
    this.selectedSlot.set('');

  }
  protected selectSlot(slot: string): void {
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedSlot.set(slot);
  }

  protected loadSlots(){
    const consultant = this.selectedConsultant();
    const date = this.selectedDate();

    if (consultant === null || date === ''){
      return;
    }
    this.selectedSlot.set('');
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.loadingSlots.set(true);
    this.slotsLoaded.set(false);
    this.slotsError.set('');

    this.consultantService.getAvailableSlots(consultant.id, date).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.slotsLoaded.set(true);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.slotsError.set('Could not load available slots.');
        this.loadingSlots.set(false);
      }
    })

  }

  protected createBooking(name: string, email:string){
    const consultant = this.selectedConsultant();
    const date = this.selectedDate();
    const time = this.selectedSlot();

    if (consultant === null || date === '' || time === '') {
      return;
    }

    const booking: BookingRequest = {
      consultantId: consultant.id,
      date: date,
      time: time,
      name: name,
      email: email,
    };

    this.bookingInProgress.set(true);
    this.bookingMessage.set('');
    this.bookingError.set('');

    this.consultantService.createBooking(booking).subscribe({
      next: (createdBooking) => {
        this.bookingMessage.set(`Booking #${createdBooking.id} created successfully`)
        this.bookingInProgress.set(false);
        this.selectedSlot.set('');
        this.slots.update((slots) => slots.filter((slot) => slot !== time));
      },
      error: () => {
        this.bookingError.set('Could not create booking. The slot may no longer be available.');
        this.bookingInProgress.set(false);
      }
    })


  }
}
