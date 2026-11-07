import {Component, signal, OnInit, inject} from '@angular/core';
import { ConsultantService} from './consultant.service';
import { Consultant} from './consultant';


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
    this.selectedConsultant.set(consultant);
    this.slots.set([]);
    this.slotsLoaded.set(false);
    this.slotsError.set('');
  }
  protected selectDate(date: string):void{
    this.selectedDate.set(date);
    this.slots.set([]);
    this.slotsLoaded.set(false);
    this.slotsError.set('');
  }
  protected loadSlots(){
    const consultant = this.selectedConsultant();
    const date = this.selectedDate();

    if (consultant === null || date === ''){
      return;
    }
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

}
