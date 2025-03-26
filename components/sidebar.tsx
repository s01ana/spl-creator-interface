import { Home, Search, Library, PlusSquare, Heart } from "lucide-react"

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Search, label: "Search" },
  { icon: Library, label: "Your Library" },
]

const playlists = ["Playlist 1", "Playlist 2", "Playlist 3", "Playlist 4"]

export default function Sidebar() {
  return (
    <div className="w-60 bg-black p-6">
      <nav className="mb-6">
        {navItems.map((item, index) => (
          <a key={index} href="#" className="flex items-center text-gray-400 hover:text-white mb-4">
            <item.icon className="mr-4" size={24} />
            <span className="font-semibold">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mb-6">
        <a href="#" className="flex items-center text-gray-400 hover:text-white mb-4">
          <PlusSquare className="mr-4" size={24} />
          <span className="font-semibold">Create Playlist</span>
        </a>
        <a href="#" className="flex items-center text-gray-400 hover:text-white">
          <Heart className="mr-4" size={24} />
          <span className="font-semibold">Liked Songs</span>
        </a>
      </div>
      <div className="border-t border-gray-800 pt-6">
        {playlists.map((playlist, index) => (
          <a key={index} href="#" className="block text-sm text-gray-400 hover:text-white mb-2">
            {playlist}
          </a>
        ))}
      </div>
    </div>
  )
}

