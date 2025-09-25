import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Event, Ticket } from '../types';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const allEvents = await api.getEvents();
        // In a real app, this filtering would be on the backend.
        const myEvents = allEvents.filter(e => e.created_by === user.id);
        setOrganizerEvents(myEvents);
        if (myEvents.length > 0) {
          setSelectedEventId(myEvents[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizerEvents();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) {
      setAttendees([]);
      return;
    };

    const fetchAttendees = async () => {
      try {
        setLoading(true);
        const attendeeData = await api.getAttendeesForEvent(selectedEventId);
        setAttendees(attendeeData);
      } catch (error) {
        console.error("Failed to fetch attendees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [selectedEventId]);

  return (
    <div className="bg-card p-8 rounded-2xl shadow-xl">
      <h1 className="text-4xl font-extrabold text-text-primary mb-6">Organizer Dashboard</h1>
      
      <div className="mb-6">
        <label htmlFor="event-select" className="block text-sm font-medium text-text-secondary mb-2">Select an Event:</label>
        <select
          id="event-select"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {organizerEvents.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mb-4">Attendees ({attendees.length})</h2>

      {loading ? (
        <p>Loading attendees...</p>
      ) : attendees.length > 0 ? (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendees.map(ticket => (
                <div key={ticket.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <img src={ticket.user?.avatar} alt={ticket.user?.name} className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-text-primary">{ticket.user?.name}</p>
                      <p className="text-sm text-text-secondary">{ticket.user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Ticket ID: {ticket.id.split('_')[1]}</p>
                    </div>
                    <div className="p-1 bg-white rounded-md shadow-sm">
                        <QRCodeSVG value={ticket.qr_code} size={64} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      ) : (
        <p className="text-text-secondary mt-4">No attendees have booked tickets for this event yet.</p>
      )}
    </div>
  );
};

export default Dashboard;