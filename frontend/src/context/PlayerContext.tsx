import { createContext, useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import type { ReactNode } from "react";

type Song = {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
    duration: number;
};

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    queue: Song[];
    currentIndex: number;
    playSong: (song: Song) => void;
    playQueue: (songs: Song[], startIndex?: number) => void;
    togglePlay: () => void;
    stopSong: () => void;
    playNext: () => void;
    playPrev: () => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

// ✅ helper to save recently played
const saveRecentSong = (song: Song) => {
    const recent = JSON.parse(localStorage.getItem("recentSongs") || "[]")
    const filtered = recent.filter((s: Song) => s._id !== song._id)
    const updated = [song, ...filtered].slice(0, 5)
    localStorage.setItem("recentSongs", JSON.stringify(updated))
}

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(new Audio());

    // ✅ Schedule checker — runs every minute
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(
                    "http://localhost:3000/schedule/get-schedule",
                    { withCredentials: true }
                );
                const schedules = res.data.schedules;
                const now = new Date();

                schedules.forEach((schedule: any) => {
                    if (schedule.isActive && new Date(schedule.scheduledTime) <= now) {
                        axios.patch(
                            `http://localhost:3000/schedule/toggle/${schedule._id}`,
                            {},
                            { withCredentials: true }
                        ).then(() => {
                            audioRef.current.src = schedule.song.audioUrl;
                            audioRef.current.play();
                            setCurrentSong(schedule.song);
                            setIsPlaying(true);
                            saveRecentSong(schedule.song) // ✅ save to recent
                        }).catch((err) => {
                            console.log("Toggle failed:", err);
                        });
                    }
                });
            } catch (error) {
                // user not logged in — skip silently
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const playSong = (song: Song) => {
        if (currentSong?._id === song._id) {
            togglePlay();
            return;
        }
        audioRef.current.src = song.audioUrl;
        audioRef.current.play();
        setCurrentSong(song);
        setIsPlaying(true);
        saveRecentSong(song) // ✅ save to recent
    };

    const playQueue = (songs: Song[], startIndex: number = 0) => {
        setQueue(songs);
        setCurrentIndex(startIndex);
        audioRef.current.src = songs[startIndex].audioUrl;
        audioRef.current.play();
        setCurrentSong(songs[startIndex]);
        setIsPlaying(true);
        saveRecentSong(songs[startIndex]) // ✅ save to recent
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const stopSong = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    };

    const playNext = () => {
        if (currentIndex < queue.length - 1) {
            const next = currentIndex + 1;
            setCurrentIndex(next);
            audioRef.current.src = queue[next].audioUrl;
            audioRef.current.play();
            setCurrentSong(queue[next]);
            setIsPlaying(true);
            saveRecentSong(queue[next]) // ✅ save to recent
        }
    };

    const playPrev = () => {
        if (currentIndex > 0) {
            const prev = currentIndex - 1;
            setCurrentIndex(prev);
            audioRef.current.src = queue[prev].audioUrl;
            audioRef.current.play();
            setCurrentSong(queue[prev]);
            setIsPlaying(true);
            saveRecentSong(queue[prev]) // ✅ save to recent
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            queue,
            currentIndex,
            playSong,
            playQueue,
            togglePlay,
            stopSong,
            playNext,
            playPrev,
            audioRef
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
    return context;
};