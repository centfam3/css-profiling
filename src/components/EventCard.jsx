import { FaHandPaper, FaCheckCircle, FaClock, FaCalendarAlt, FaMapPin } from 'react-icons/fa'

export default function EventCard({ event, isAssigned = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        {isAssigned && event.status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              event.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {event.status === 'confirmed' ? <FaCheckCircle /> : <FaClock />}
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <p className="flex items-center gap-1"><FaCalendarAlt className="inline text-green-500" /> <span className="font-medium">{event.date}</span></p>
        <p className="flex items-center gap-1"><FaClock className="inline text-blue-500" /> <span className="font-medium">{event.time}</span></p>
        <p className="flex items-center gap-1"><FaMapPin className="inline text-red-500" /> <span className="font-medium">{event.location}</span></p>
      </div>

      <p className="text-gray-700 mb-4">{event.description}</p>

      {isAssigned && event.role && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-700"><span className="font-semibold">Your Role:</span> {event.role}</p>
        </div>
      )}

      {!isAssigned ? (
        <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2">
          <FaHandPaper /> Request to Join
        </button>
      ) : (
        <button className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition">
          View Details
        </button>
      )}
    </div>
  )
}
