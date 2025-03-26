import { Play } from "lucide-react"

const recentlyPlayed = [
  { title: "Liked Songs", image: "/placeholder.svg?height=150&width=150", color: "from-purple-800" },
  { title: "Lofi Beats", image: "/placeholder.svg?height=150&width=150", color: "from-blue-800" },
  { title: "Top Hits 2023", image: "/placeholder.svg?height=150&width=150", color: "from-red-800" },
  { title: "Chill Vibes", image: "/placeholder.svg?height=150&width=150", color: "from-green-800" },
  { title: "Workout Mix", image: "/placeholder.svg?height=150&width=150", color: "from-yellow-800" },
  { title: "Indie Picks", image: "/placeholder.svg?height=150&width=150", color: "from-pink-800" },
]

export default function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Good afternoon</h1>
      <div className="grid grid-cols-3 gap-6">
        {recentlyPlayed.map((item, index) => (
          <div
            key={index}
            className={`relative group overflow-hidden rounded-md bg-gradient-to-br ${item.color} to-gray-900`}
          >
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className="w-20 h-20 object-cover absolute left-4 top-4 shadow-lg"
            />
            <div className="p-4 h-full flex items-end">
              <h3 className="text-lg font-bold ml-24">{item.title}</h3>
            </div>
            <button className="absolute right-4 bottom-4 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play fill="black" size={24} />
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

