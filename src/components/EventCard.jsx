import { useState } from 'react'
import axios from 'axios'
import { FaHandPaper, FaCheckCircle, FaClock, FaCalendarAlt, FaMapPin, FaCheck, FaHourglassHalf } from 'react-icons/fa'

export default function EventCard({ event, isAssigned = false, user, onEventUpdated, hasPending = false }) {
  const [requesting, setRequesting] = useState(false)
  const [registered, setRegistered] = useState(isAssigned)
  const [pending, setPending] = useState(hasPending)

  const handleRequest = async () => {
    const url = `http://localhost:5000/api/events/${event.id}/request`;
    console.log('=== REQUEST DEBUG ===');
    console.log('Event ID:', event.id);
    console.log('Event _id:', event._id);
    console.log('Event full data:', JSON.stringify(event, null, 2));
    console.log('User ID:', user?.id);
    console.log('Full URL:', url);
    console.log('====================');
    
    if (!user?.id) {
      alert('Please log in to request for events')
      return
    }

    setRequesting(true)
    try {
      const response = await axios.post(url, {
        studentId: user.id
      })

      setPending(true)

      if (onEventUpdated) {
        onEventUpdated(response.data)
      }

      alert('Request sent successfully! Please wait for admin/faculty approval.')
    } catch (error) {
      console.error('Error requesting for event:', error)
      alert('Error requesting: ' + (error.response?.data?.message || error.message))
    } finally {
      setRequesting(false)
    }
  }

  const title = event.name || event.title
  const location = event.venue || event.location
  const date = event.date
  const time = event.time
  const description = event.description
  const maxParticipants = event.maxParticipants
  const currentParticipants = event.participants?.length || 0
  const pendingCount = event.pendingRequests?.length || 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {registered && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-green-100 text-green-700">
            <FaCheckCircle /> Registered
          </span>
        )}
        {pending && !registered && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-yellow-100 text-yellow-700">
            <FaHourglassHalf /> Pending
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        {date && <p className="flex items-center gap-1"><FaCalendarAlt className="inline text-green-500" /> <span className="font-medium">{date}</span></p>}
        {time && <p className="flex items-center gap-1"><FaClock className="inline text-blue-500" /> <span className="font-medium">{time}</span></p>}
        {location && <p className="flex items-center gap-1"><FaMapPin className="inline text-red-500" /> <span className="font-medium">{location}</span></p>}
      </div>

      {description && <p className="text-gray-700 mb-4">{description}</p>}

      {maxParticipants && (
        <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
          <p className="text-gray-700"><span className="font-semibold">Participants:</span> {currentParticipants}/{maxParticipants}</p>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(currentParticipants / maxParticipants) * 100}%` }}
            ></div>
          </div>
          {pendingCount > 0 && (
            <p className="text-gray-500 text-xs mt-1"><span className="font-semibold">Pending Requests:</span> {pendingCount}</p>
          )}
        </div>
      )}

      {!registered && !pending && (
        <button
          onClick={handleRequest}
          disabled={requesting || (maxParticipants && currentParticipants >= maxParticipants)}
          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaHandPaper /> {requesting ? 'Sending Request...' : 'Request to Join'}
        </button>
      )}

      {pending && !registered && (
        <button
          disabled
          className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <FaHourglassHalf /> Pending Approval
        </button>
      )}

      {registered && (
        <button
          disabled
          className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <FaCheck /> Registered
        </button>
      )}
    </div>
  )
}