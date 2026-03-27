import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { connectSocket, disconnectSocket } from "../socket";

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

    // ✅ Socket setup — reads userId directly from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) return // not logged in — skip

        const user = JSON.parse(storedUser)
        const userId = user._id

        if (!userId) return

        // ✅ connect socket with userId
        const socket = connectSocket(userId)

        // ✅ listen for cron-triggered song
        socket.on("play-song", ({ song }: { song: Song }) => {
            console.log("🎵 Scheduled song triggered:", song.title)
            audioRef.current.src = song.audioUrl
            audioRef.current.play()
            setCurrentSong(song)
            setIsPlaying(true)
            saveRecentSong(song)
        })

        // ✅ cleanup on unmount
        return () => {
            socket.off("play-song")
            disconnectSocket()
        }
    }, [])

    const playSong = (song: Song) => {
        if (currentSong?._id === song._id) {
            togglePlay();
            return;
        }
        audioRef.current.src = song.audioUrl;
        audioRef.current.play();
        setCurrentSong(song);
        setIsPlaying(true);
        saveRecentSong(song)
    };

    const playQueue = (songs: Song[], startIndex: number = 0) => {
        setQueue(songs);
        setCurrentIndex(startIndex);
        audioRef.current.src = songs[startIndex].audioUrl;
        audioRef.current.play();
        setCurrentSong(songs[startIndex]);
        setIsPlaying(true);
        saveRecentSong(songs[startIndex])
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
            saveRecentSong(queue[next])
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
            saveRecentSong(queue[prev])
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