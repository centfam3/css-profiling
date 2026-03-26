import { FaCalendarAlt } from 'react-icons/fa'

const mockAnnouncements = [
  {
    id: 1,
    title: 'Mid-Year Semester Break Schedule',
    date: 'April 5, 2024',
    category: 'Academic',
    content:
      'The mid-year break will be from April 20-26, 2024. Classes resume on April 27. Please plan your activities accordingly.',
  },
  {
    id: 2,
    title: 'New Library Extended Hours',
    date: 'April 3, 2024',
    category: 'Notice',
    content:
      'The library will now be open until 10 PM during weekdays to support student studying needs.',
  },
  {
    id: 3,
    title: 'Scholarship Application Deadline',
    date: 'March 30, 2024',
    category: 'Scholarship',
    content:
      'Apply now for the Merit-Based Scholarship 2024. Deadline is April 15, 2024. Interested candidates can submit applications at the Student Services Office.',
  },
  {
    id: 4,
    title: 'Campus Maintenance Notice',
    date: 'March 28, 2024',
    category: 'Maintenance',
    content:
      'Water and electrical maintenance will be conducted on parking areas from April 10-12. Kindly use alternative parking during these dates.',
  },
  {
    id: 5,
    title: 'Enrollment for Next Semester Opens',
    date: 'March 25, 2024',
    category: 'Academic',
    content:
      'Online enrollment for the next semester is now open. Register for your subjects through the student portal before April 5, 2024.',
  },
]

function AnnouncementCard({ announcement }) {
  const categoryColor = {
    Academic: 'bg-blue-100 text-blue-700',
    Notice: 'bg-gray-100 text-gray-700',
    Scholarship: 'bg-green-100 text-green-700',
    Maintenance: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 max-w-sm">{announcement.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor[announcement.category] || categoryColor.Notice}`}>
          {announcement.category}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
        <FaCalendarAlt className="text-gray-400" />
        {announcement.date}
      </p>
      <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
    </div>
  )
}

export default function StudentAnnouncements() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
      <p className="text-gray-600 mb-6">Stay updated with the latest news and announcements from the administration</p>

      <div className="space-y-4">
        {mockAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </div>
  )
}
