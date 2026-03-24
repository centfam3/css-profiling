import { useState } from 'react'
import EventCard from './EventCard'

const mockAvailableEvents = [
  {
    id: 1,
    title: 'Inter-College Tech Summit 2024',
    date: 'May 15, 2024',
    time: '9:00 AM - 5:00 PM',
    location: 'Main Auditorium',
    description: 'A grand summit featuring industry experts discussing the latest in technology and innovation.',
  },
  {
    id: 2,
    title: 'Science Fair & Exhibition',
    date: 'May 20, 2024',
    time: '2:00 PM - 8:00 PM',
    location: 'Campus Grounds',
    description: 'Showcase your projects and innovations. All students welcome to participate.',
  },
  {
    id: 3,
    title: 'Sports Day 2024',
    date: 'June 1, 2024',
    time: '7:00 AM - 4:00 PM',
    location: 'Athletics Track',
    description: 'Compete in various sports events and represent your year level.',
  },
  {
    id: 4,
    title: 'Debate Competition',
    date: 'May 25, 2024',
    time: '1:00 PM - 6:00 PM',
    location: 'Conference Hall',
    description: 'National debate championship. Register your team of 2-3 members.',
  },
]

const mockAssignedEvents = [
  {
    id: 101,
    title: 'Volunteer Orientation',
    date: 'May 10, 2024',
    time: '10:00 AM - 12:00 PM',
    location: 'Room 303',
    description: 'Orientation for volunteer coordinators and event facilitators.',
    status: 'confirmed',
    role: 'Event Facilitator',
  },
  {
    id: 102,
    title: 'Workshop: Web Development',
    date: 'May 18, 2024',
    time: '3:00 PM - 5:00 PM',
    location: 'Lab 2',
    description: 'Professional development workshop on modern web technologies.',
    status: 'pending',
    role: 'Participant',
  },
]

export default function EventParticipation() {
  const [activeTab, setActiveTab] = useState('available')

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'available'
          ? mockAvailableEvents.map((event) => (
              <EventCard key={event.id} event={event} isAssigned={false} />
            ))
          : mockAssignedEvents.map((event) => (
              <EventCard key={event.id} event={event} isAssigned={true} />
            ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">📢 Info:</span> Click "Request to Join" to participate in available events. Requests will be reviewed by event coordinators.
        </p>
      </div>
    </div>
  )
}
