import { Play, SkipBack, SkipForward, Repeat, Shuffle, Volume2 } from "lucide-react"

export default function NowPlaying() {
  return (
    <div className="h-20 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between">
      <div className="flex items-center w-1/3">
        <img src="/placeholder.svg?height=56&width=56" alt="Album cover" className="w-14 h-14 mr-4" />
        <div>
          <h4 className="text-sm font-semibold">Song Title</h4>
          <p className="text-xs text-gray-400">Artist Name</p>
        </div>
      </div>
      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center mb-2">
          <Shuffle size={20} className="text-gray-400 mr-6" />
          <SkipBack size={20} className="text-gray-400 mr-6" />
          <button className="bg-white rounded-full p-2">
            <Play fill="black" size={20} />
          </button>
          <SkipForward size={20} className="text-gray-400 ml-6" />
          <Repeat size={20} className="text-gray-400 ml-6" />
        </div>
        <div className="w-full flex items-center">
          <span className="text-xs text-gray-400 mr-2">1:23</span>
          <div className="flex-1 h-1 bg-gray-600 rounded-full">
            <div className="w-1/3 h-full bg-gray-200 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2">3:45</span>
        </div>
      </div>
      <div className="flex items-center justify-end w-1/3">
        <Volume2 size={20} className="text-gray-400" />
        <div className="w-24 h-1 bg-gray-600 rounded-full ml-2">
          <div className="w-3/4 h-full bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

