
import type { User, Event, Ticket } from '../types';

// --- MOCK DATABASE ---
const users: User[] = [
    { id: 'user_2clK3J4fQ6sA8tZ9eR1bYgX0wVf', email: 'organizer@example.com', name: 'Alex Organizer', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { id: 'user_1aB2c3d4e5f6g7h8i9j0k1l', email: 'attendee@example.com', name: 'Sam Attendee', avatar: 'https://i.pravatar.cc/150?u=sam' },
];

let events: Event[] = [
    {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        title: 'React Summit 2024',
        description: 'The biggest conference for React developers. Join us for two days of talks, workshops, and networking.',
        venue: 'Online',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        total_tickets: 500,
        tickets_sold: 120,
        created_by: 'user_2clK3J4fQ6sA8tZ9eR1bYgX0wVf',
        image: 'https://picsum.photos/seed/react/1200/800'
    },
    {
        id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
        title: 'Tailwind CSS Workshop',
        description: 'A hands-on workshop to master Tailwind CSS from scratch. Perfect for beginners and intermediate developers.',
        venue: 'Community Hub, San Francisco',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        total_tickets: 50,
        tickets_sold: 25,
        created_by: 'user_2clK3J4fQ6sA8tZ9eR1bYgX0wVf',
        image: 'https://picsum.photos/seed/tailwind/1200/800'
    },
    {
        id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
        title: 'ViteConf',
        description: 'Explore the future of frontend tooling with the creators of Vite and other industry leaders.',
        venue: 'Virtual Event',
        date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        total_tickets: 1000,
        tickets_sold: 850,
        created_by: 'user_2clK3J4fQ6sA8tZ9eR1bYgX0wVf',
        image: 'https://picsum.photos/seed/vite/1200/800'
    },
];

let tickets: Ticket[] = [];

// --- REALTIME SIMULATION ---
type Listener = (event: Event) => void;
const listeners: Record<string, Listener[]> = {};

const notifyListeners = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && listeners[eventId]) {
        listeners[eventId].forEach(listener => listener(event));
    }
};


// --- MOCK API FUNCTIONS ---
export const api = {
    // --- AUTH ---
    // Simulates Clerk login by returning a mock user
    login: async (email: string): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = users.find(u => u.email === email) || users[1]; // default to attendee
                resolve(user);
            }, 500);
        });
    },

    // --- EVENTS ---
    getEvents: async (): Promise<Event[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...events]), 500));
    },

    getEventById: async (id: string): Promise<Event | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(events.find(e => e.id === id)), 500));
    },

    // --- TICKETS ---
    bookTicket: async (eventId: string, userId: string): Promise<Ticket> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const event = events.find(e => e.id === eventId);
                const user = users.find(u => u.id === userId);
                if (!event || !user) {
                    return reject(new Error('Event or User not found'));
                }
                if (event.tickets_sold >= event.total_tickets) {
                    return reject(new Error('Event is sold out'));
                }

                // Check if user already has a ticket
                const existingTicket = tickets.find(t => t.event_id === eventId && t.user_id === userId);
                if (existingTicket) {
                   return reject(new Error('You have already booked a ticket for this event.'));
                }

                event.tickets_sold += 1;

                const newTicket: Ticket = {
                    id: `ticket_${Math.random().toString(36).substr(2, 9)}`,
                    event_id: eventId,
                    user_id: userId,
                    qr_code: JSON.stringify({ eventId, userId, ticketId: `ticket_${Math.random().toString(36).substr(2, 9)}` }),
                    created_at: new Date().toISOString(),
                };
                tickets.push(newTicket);
                
                // Notify realtime listeners
                notifyListeners(eventId);

                resolve(newTicket);
            }, 1000);
        });
    },

    getTicketForEventByUser: async (eventId: string, userId: string): Promise<Ticket | undefined> => {
         return new Promise(resolve => setTimeout(() => resolve(tickets.find(t => t.event_id === eventId && t.user_id === userId)), 300));
    },

    // --- DASHBOARD ---
    getAttendeesForEvent: async (eventId: string): Promise<Ticket[]> => {
         return new Promise((resolve) => {
            setTimeout(() => {
                const eventTickets = tickets.filter(t => t.event_id === eventId);
                const populatedTickets = eventTickets.map(ticket => {
                    return {
                        ...ticket,
                        user: users.find(u => u.id === ticket.user_id),
                        event: events.find(e => e.id === ticket.event_id)
                    };
                });
                resolve(populatedTickets);
            }, 700);
        });
    },
    
    // --- REALTIME ---
    // Simulates Supabase Realtime subscription
    subscribeToEventUpdates: (eventId: string, callback: Listener): (() => void) => {
        if (!listeners[eventId]) {
            listeners[eventId] = [];
        }
        listeners[eventId].push(callback);
        
        // Return an unsubscribe function
        return () => {
            listeners[eventId] = listeners[eventId].filter(l => l !== callback);
        };
    }
};
