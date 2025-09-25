
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../types';
import { api } from '../services/api';

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const remainingTickets = event.total_tickets - event.tickets_sold;
  const isSoldOut = remainingTickets <= 0;

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
      <img className="h-56 w-full object-cover" src={event.image} alt={event.title} />
      <div className="p-6">
        <p className="text-sm text-primary font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h3 className="text-2xl font-bold mt-2 text-text-primary">{event.title}</h3>
        <p className="text-text-secondary mt-1">{event.venue}</p>
        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/event/${event.id}`} 
            className={`px-6 py-2 rounded-full font-semibold text-white transition-colors ${isSoldOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
            onClick={(e) => isSoldOut && e.preventDefault()}
          >
            {isSoldOut ? 'Sold Out' : 'View Details'}
          </Link>
          <div className={`text-right font-medium ${isSoldOut ? 'text-red-500' : 'text-secondary'}`}>
            <span className="block text-lg">{remainingTickets}</span>
            <span className="block text-xs text-text-secondary">Tickets Left</span>
          </div>
        </div>
      </div>
    </div>
  );
};


const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-xl font-medium">Loading events...</div>;
  }
  
  if (events.length === 0) {
      return <div className="text-center py-10 text-xl text-text-secondary">No events found.</div>
  }

  return (
    <div>
        <h1 className="text-4xl font-extrabold text-center mb-12 text-text-primary">Upcoming Events</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    </div>
  );
};

export default EventList;
