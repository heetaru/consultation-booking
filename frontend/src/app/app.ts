import { Component, signal, inject } from '@angular/core';
import { ConsultantService } from './consultant.service';
import { Consultant } from './consultant';
import { BookingRequest } from './booking';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly consultantService = inject(ConsultantService);

  protected readonly selectedConsultant = signal<Consultant | null>(null);
  protected readonly selectedDate = signal('');
  protected readonly selectedSlot = signal('');
  private readonly slotsRequested = signal(false);

  protected readonly consultantsResource = this.consultantService.createConsultantsResource();
  protected readonly bookingsResource = this.consultantService.createBookingsResource();
  protected readonly slotsResource = this.consultantService.createSlotsResource(
    this.selectedConsultant,
    this.selectedDate,
    this.slotsRequested,
  );

  protected readonly bookingInProgress = signal(false);
  protected readonly bookingMessage = signal('');
  protected readonly bookingError = signal('');

  protected selectConsultant(consultant: Consultant): void {
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.slotsRequested.set(false);
    this.selectedConsultant.set(consultant);
    this.selectedSlot.set('');
  }

  protected selectDate(date: string): void {
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.slotsRequested.set(false);
    this.selectedDate.set(date);
    this.selectedSlot.set('');
  }

  protected selectSlot(slot: string): void {
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedSlot.set(slot);
  }

  protected loadSlots(): void {
    if (this.selectedConsultant() === null || this.selectedDate() === '') {
      return;
    }

    this.selectedSlot.set('');
    this.bookingMessage.set('');
    this.bookingError.set('');

    if (this.slotsRequested()) {
      this.slotsResource.reload();
    } else {
      this.slotsRequested.set(true);
    }
  }

  protected createBooking(name: string, email: string): void {
    const consultant = this.selectedConsultant();
    const date = this.selectedDate();
    const time = this.selectedSlot();

    if (consultant === null || date === '' || time === '' || this.bookingInProgress()) {
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
        this.bookingMessage.set(`Booking #${createdBooking.id} created successfully`);
        this.bookingInProgress.set(false);
        this.selectedSlot.set('');
        this.slotsResource.reload();
        this.bookingsResource.reload();
      },
      error: () => {
        this.bookingError.set('Could not create booking. The slot may no longer be available.');
        this.bookingInProgress.set(false);
      },
    });
  }
}
