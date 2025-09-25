import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import type { Event, Ticket } from '../types';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [bookedTicket, setBookedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingState, setBookingState] = useState<'idle' | 'booking' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [remainingTickets, setRemainingTickets] = useState(0);

  const fetchEventData = useCallback(async () => {
    if (!id) return;
    try {
      const eventData = await api.getEventById(id);
      if (eventData) {
        setEvent(eventData);
        setRemainingTickets(eventData.total_tickets - eventData.tickets_sold);
      }
      if (user) {
        const ticketData = await api.getTicketForEventByUser(id, user.id);
        if (ticketData) {
          setBookedTicket(ticketData);
          setBookingState('success');
        }
      }
    } catch (error) {
      console.error("Failed to fetch event details:", error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = api.subscribeToEventUpdates(id, (updatedEvent) => {
      console.log('Realtime update received:', updatedEvent);
      setEvent(updatedEvent);
      setRemainingTickets(updatedEvent.total_tickets - updatedEvent.tickets_sold);
    });
    return () => unsubscribe();
  }, [id]);

  const handleBookTicket = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!id) return;

    setBookingState('booking');
    try {
      const newTicket = await api.bookTicket(id, user.id);
      setBookedTicket(newTicket);
      setBookingState('success');
    } catch (error: any) {
      setBookingState('error');
      setErrorMessage(error.message || 'Failed to book ticket.');
      console.error(error);
    }
  };
  
  const isSoldOut = remainingTickets <= 0;

  if (loading) return <div className="text-center text-xl p-10">Loading Event Details...</div>;
  if (!event) return <div className="text-center text-xl p-10">Event not found.</div>;

  return (
    <>
    <div className="bg-card rounded-2xl shadow-xl p-4 md:p-8 lg:p-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <img src={event.image} alt={event.title} className="rounded-xl w-full h-auto object-cover aspect-video" />
        </div>
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">{event.title}</h1>
          <div className="flex items-center space-x-4 text-text-secondary mb-4">
            <span>📅 {new Date(event.date).toDateString()}</span>
            <span>📍 {event.venue}</span>
          </div>
          <p className="text-text-secondary text-lg mb-6">{event.description}</p>
          
          <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center mb-6">
            <div className="font-bold text-2xl text-primary">
                {remainingTickets}
                <span className="text-sm font-medium text-text-secondary ml-2">Tickets Left</span>
            </div>
            <div className="text-sm text-text-secondary">Total Capacity: {event.total_tickets}</div>
          </div>
          
          {bookingState === 'success' && bookedTicket ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-green-800 mb-4">Your Ticket is Confirmed!</h3>
                <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
                    <QRCodeSVG value={bookedTicket.qr_code} size={180} />
                </div>
                <p className="text-green-700 mt-4">Show this QR code at the event entrance.</p>
            </div>
          ) : (
            <>
              <button 
                onClick={handleBookTicket} 
                disabled={isSoldOut || bookingState === 'booking'}
                className="w-full text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center
                          bg-primary hover:bg-primary-hover 
                          disabled:bg-gray-400"
              >
                {bookingState === 'booking' ? 'Booking...' : isSoldOut ? 'Sold Out' : 'Book Your Ticket Now'}
              </button>
              {bookingState === 'error' && <p className="text-red-500 mt-4 text-center">{errorMessage}</p>}
            </>
          )}

        </div>
      </div>
    </div>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default EventDetail;