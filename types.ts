
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  total_tickets: number;
  tickets_sold: number;
  created_by: string;
  image: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  qr_code: string;
  created_at: string;
  user?: User;
  event?: Event;
}
