export interface BookingRequest {
  consultantId: number;
  date: string;
  time: string;
  name: string;
  email: string;
}

export interface BookingResponse {
  id: number;
  consultantId: number;
  date: string;
  time: string;
  name: string;
  email: string;
}
