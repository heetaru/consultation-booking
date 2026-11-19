import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal, inject } from '@angular/core';
import { ConsultantService } from './consultant.service';
import { Consultant } from './consultant';
import { BookingRequest, BookingResponse } from './booking';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [
    DatePipe,
    NgTemplateOutlet,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly consultantService = inject(ConsultantService);
  protected readonly bookingConsultantFilter = signal<number | null>(null);
  protected readonly filterValidationError = signal('');

  protected readonly consultantsResource = this.consultantService.createConsultantsResource();
  protected readonly consultantNames = computed(() => {
    const consultants = this.consultantsResource.hasValue() ? this.consultantsResource.value() : [];
    return new Map(consultants.map((consultant) => [consultant.id, consultant.name]));
  });
  protected readonly bookingResource = this.consultantService.createBookingResource(
    this.bookingConsultantFilter,
  );

  protected readonly searchedBookingId = signal<number | null>(null);
  protected readonly searchValidationError = signal('');
  protected readonly bookingSearchResource = this.consultantService.createBookingSearchResource(
    this.searchedBookingId,
  );

  protected readonly selectedConsultant = signal<Consultant | null>(null);
  protected readonly selectedDate = signal('');
  private readonly slotsRequested = signal(false);

  protected readonly slotsResource = this.consultantService.createSlotsResource(
    this.selectedConsultant,
    this.selectedDate,
    this.slotsRequested,
  );

  protected readonly selectedSlot = signal('');
  protected readonly bookingInProgress = signal(false);
  protected readonly bookingMessage = signal('');
  protected readonly bookingError = signal('');

  protected readonly cancelingBookingId = signal<number | null>(null);
  protected readonly cancelingMessage = signal('');
  protected readonly cancelingError = signal('');

  protected selectConsultant(consultant: Consultant): void {
    this.slotsRequested.set(false);

    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedConsultant.set(consultant);
    this.selectedSlot.set('');
  }

  protected selectDate(date: string): void {
    this.slotsRequested.set(false);

    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedDate.set(date);
    this.selectedSlot.set('');
  }

  protected selectSlot(slot: string): void {
    this.bookingMessage.set('');
    this.bookingError.set('');
    this.selectedSlot.set(slot);
  }

  protected loadSlots() {
    const consultant = this.selectedConsultant();
    const date = this.selectedDate();

    if (consultant === null || date === '') {
      return;
    }
    this.selectedSlot.set('');
    this.bookingMessage.set('');
    this.bookingError.set('');

    if (this.slotsRequested() === true) {
      this.slotsResource.reload();
    } else {
      this.slotsRequested.set(true);
    }
  }

  protected createBooking(name: string, email: string) {
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
        this.bookingMessage.set(`Booking #${createdBooking.id} created successfully`);
        this.bookingInProgress.set(false);
        this.selectedSlot.set('');
        this.slotsResource.reload();
        this.bookingResource.reload();
      },
      error: () => {
        this.bookingError.set('Could not create booking. The slot may no longer be available.');
        this.bookingInProgress.set(false);
      },
    });
  }
  protected cancelBooking(id: number) {
    if (this.cancelingBookingId() != null) {
      return;
    }
    this.cancelingError.set('');
    this.cancelingMessage.set('');

    this.cancelingBookingId.set(id);

    this.consultantService.cancelBooking(id).subscribe({
      next: () => {
        this.cancelingMessage.set(`Booking #${id} has been cancelled.`);
        this.cancelingError.set('');
        this.cancelingBookingId.set(null);
        if (this.searchedBookingId() === id) this.searchedBookingId.set(null);
        this.bookingResource.reload();
        this.slotsResource.reload();
      },
      error: () => {
        this.cancelingMessage.set('');
        this.cancelingError.set(`Could not cancel booking #${id}.`);
        this.cancelingBookingId.set(null);
      },
    });
  }

  protected searchBooking(id: number) {
    this.searchValidationError.set('');

    if (id <= 0 || !Number.isInteger(id)) {
      this.searchedBookingId.set(null);
      this.searchValidationError.set('Enter a positive id number.');
      return;
    }
    if (id === this.searchedBookingId()) {
      this.bookingSearchResource.reload();
      return;
    }

    this.searchedBookingId.set(id);
  }

  protected filterBookings(consultantId: string) {
    this.filterValidationError.set('');

    const value = consultantId.trim();
    if (value === '') {
      this.bookingConsultantFilter.set(null);
      return;
    }

    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      this.filterValidationError.set('Enter a positive whole consultant ID.');
      return;
    }

    this.bookingConsultantFilter.set(id);
  }
}
