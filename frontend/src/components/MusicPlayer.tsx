import { useEffect, useState } from "react";
import { Play, Pause, Square, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

const MusicPlayer = () => {
    const { currentSong, isPlaying, togglePlay, stopSong, playNext, playPrev, audioRef } = usePlayer();
    const [progress, setProgress] = useState(0);

    // update progress bar
    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.addEventListener("timeupdate", updateProgress);
        return () => audio.removeEventListener("timeupdate", updateProgress);
    }, []);

    if (!currentSong) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-6 py-4 z-50">

            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-700 rounded-full mb-4">
                <div
                    className="h-1 bg-green-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between">

                {/* Song Info */}
                <div className="flex items-center gap-4 w-1/3">
                    <img
                        src={currentSong.imageUrl || "https://via.placeholder.com/50"}
                        alt={currentSong.title}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <p className="text-white font-medium text-sm">{currentSong.title}</p>
                        <p className="text-gray-400 text-xs">{currentSong.artist}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">

                    {/* Previous */}
                    <button
                        onClick={playPrev}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <SkipBack size={22} />
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition"
                    >
                        {isPlaying
                            ? <Pause size={20} className="text-white" />
                            : <Play size={20} className="text-white" />
                        }
                    </button>

                    {/* Next */}
                    <button
                        onClick={playNext}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <SkipForward size={22} />
                    </button>

                    {/* Stop */}
                    <button
                        onClick={stopSong}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition"
                    >
                        <Square size={18} className="text-white" />
                    </button>
                </div>

                {/* Right side */}
                <div className="w-1/3 flex justify-end">
                    <p className="text-gray-400 text-xs">Music Tune</p>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;