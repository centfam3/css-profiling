import { useState, useEffect } from 'react'
import axios from 'axios'
import EventCard from './EventCard'

export default function EventParticipation({ user }) {
  const [activeTab, setActiveTab] = useState('available')
  const [availableEvents, setAvailableEvents] = useState([])
  const [pendingEvents, setPendingEvents] = useState([])
  const [assignedEvents, setAssignedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const eventsRes = await axios.get('http://localhost:5000/api/events');
      const allEvents = eventsRes.data;

      const available = allEvents.filter(event =>
        !event.participants?.includes(user?.id) && !event.pendingRequests?.includes(user?.id)
      );

      const pending = allEvents.filter(event =>
        event.pendingRequests?.includes(user?.id) && !event.participants?.includes(user?.id)
      );

      const assigned = allEvents.filter(event =>
        event.participants?.includes(user?.id)
      );

      setAvailableEvents(available);
      setPendingEvents(pending);
      setAssignedEvents(assigned);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setAvailableEvents([]);
      setPendingEvents([]);
      setAssignedEvents([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  const handleEventUpdated = () => {
    fetchEvents();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Participation</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'available'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available Events
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Requests {pendingEvents.length > 0 && `(${pendingEvents.length})`}
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'assigned'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Assigned Events
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 font-medium">Loading events...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'available' ? (
            availableEvents.length > 0 ? (
              availableEvents.map((event) => (
                <EventCard key={event.id} event={event} isAssigned={false} user={user} hasPending={false} onEventUpdated={handleEventUpdated} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-medium">No available events at the moment</p>
                <p className="text-gray-400 text-sm mt-1">Check back soon for upcoming events!</p>
              </div>
            )
          ) : activeTab === 'pending' ? (
            pendingEvents.length > 0 ? (
              pendingEvents.map((event) => (
                <EventCard key={event.id} event={event} isAssigned={false} user={user} hasPending={true} onEventUpdated={handleEventUpdated} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-medium">No pending requests</p>
                <p className="text-gray-400 text-sm mt-1">Your request approvals will appear here!</p>
              </div>
            )
          ) : (
            assignedEvents.length > 0 ? (
              assignedEvents.map((event) => (
                <EventCard key={event.id} event={event} isAssigned={true} user={user} hasPending={false} onEventUpdated={handleEventUpdated} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-medium">You haven't joined any events yet</p>
                <p className="text-gray-400 text-sm mt-1">Browse available events to join!</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">📢 Info:</span> Click "Request to Join" to send a request. Your request will be reviewed by admin/faculty before being approved. Only approved requests will appear in "Assigned Events".
        </p>
      </div>
    </div>
  )
}