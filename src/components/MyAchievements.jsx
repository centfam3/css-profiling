import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

const mockAchievements = {
  academic: [
    {
      id: 1,
      title: 'Dean\'s List Recognition',
      date: 'Feb 2024',
      description: 'Achieved 3.8 GPA in Fall semester 2023',
      status: 'approved',
      category: 'Academic',
    },
    {
      id: 2,
      title: 'Programming Competition Winner',
      date: 'Jan 2024',
      description: 'Won 1st place in Inter-College Code Sprint',
      status: 'approved',
      category: 'Academic',
    },
    {
      id: 3,
      title: 'Research Paper Published',
      date: 'Mar 2024',
      description: 'Published paper on AI in Education',
      status: 'pending',
      category: 'Academic',
    },
    {
      id: 4,
      title: 'Outstanding Thesis Defense',
      date: 'Apr 2024',
      description: 'Capstone project approved with excellent remarks',
      status: 'pending',
      category: 'Academic',
    },
  ],
  sports: [
    {
      id: 5,
      title: 'Basketball Championship',
      date: 'Dec 2023',
      description: 'Participated as team captain in SWIC Games 2023',
      status: 'approved',
      category: 'Sports',
    },
    {
      id: 6,
      title: 'UAAP Badminton Runner-up',
      date: 'Nov 2023',
      description: 'Men\'s doubles – 2nd place finish',
      status: 'approved',
      category: 'Sports',
    },
    {
      id: 7,
      title: 'Track and Field Record',
      date: 'Feb 2024',
      description: 'New school record in 400m sprint',
      status: 'rejected',
      category: 'Sports',
    },
  ],
}

export function AchievementCard({ achievement }) {
  const statusColor = {
    approved: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-200' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-200' },
  }

  const color = statusColor[achievement.status] || statusColor.pending

  return (
    <div className={`${color.bg} border-l-4 border-l-${achievement.status === 'approved' ? 'green' : achievement.status === 'pending' ? 'yellow' : 'red'}-500 p-5 rounded-lg hover:shadow-md transition`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-lg">{achievement.title}</h3>
        <span className={`${color.badge} ${color.text} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>
          {achievement.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
      <p className="text-xs text-gray-500">{achievement.date}</p>
    </div>
  )
}

export function AchievementForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    date: '',
    description: '',
    proof: null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ title: '', category: 'Academic', date: '', description: '', proof: null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Achievement Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Dean's List"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your achievement..."
          rows="4"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Proof/Certificate</label>
        <input
          type="file"
          onChange={(e) => setFormData({ ...formData, proof: e.target.files?.[0] })}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition"
        >
          Submit Achievement
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function MyAchievements() {
  const [activeTab, setActiveTab] = useState('academic')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [achievements, setAchievements] = useState(mockAchievements)

  const handleAddAchievement = (formData) => {
    const newAchievement = {
      id: Math.max(...Object.values(achievements).flat().map((a) => a.id), 0) + 1,
      ...formData,
      status: 'pending',
    }
    const category = formData.category.toLowerCase()
    setAchievements({
      ...achievements,
      [category]: [...achievements[category], newAchievement],
    })
    setIsFormOpen(false)
  }

  const displayAchievements = activeTab === 'academic' ? achievements.academic : achievements.sports

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Achievements</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition"
        >
          <FaPlus /> Add Achievement
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'academic'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Academic
        </button>
        <button
          onClick={() => setActiveTab('sports')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'sports'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Sports
        </button>
      </div>

      {/* Achievement List */}
      <div className="space-y-4">
        {displayAchievements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">No achievements yet</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Add Your First Achievement
            </button>
          </div>
        ) : (
          displayAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))
        )}
      </div>

      {/* Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">📋 Note:</span> Submitted achievements are reviewed by the Admin. You'll be notified once they're approved or rejected.
        </p>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Achievement</h2>
            <AchievementForm onSubmit={handleAddAchievement} onClose={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
