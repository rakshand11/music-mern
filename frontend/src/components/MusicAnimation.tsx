import { useState } from "react";
import {
    Music,
    Headphones,
    Radio,
    Mic,
    Disc3,
    Play,
    Pause,
} from "lucide-react";

const icons = [Music, Headphones, Radio, Mic, Disc3, Play, Pause];
const colors = [
    "text-pink-400/70",
    "text-yellow-400/70",
    "text-blue-400/70",
];

const MusicBackground = () => {
    const ICON_COUNT = 50;

    const [notes] = useState(() =>
        Array.from({ length: ICON_COUNT }, (_, i) => ({
            left: Math.random() * 100,
            right: Math.random() * 100,
            bottom: Math.random() * 100,
            size: Math.random() * 35 + 30,
            duration: Math.random() * 7 + 7,
            delay: Math.random() * 2,
            icon: icons[i % icons.length],
            color: colors[i % colors.length],
        }))
    );

    return (
        <div className="absolute inset-0 overflow-hidden z-0">
            {notes.map((note, i) => {
                const Icon = note.icon;

                return (
                    <Icon
                        key={i}
                        className={`absolute ${note.color}`}
                        style={{
                            left: `${note.left}%`,
                            right: `${note.right}%`,
                            bottom: `${note.bottom}%`,
                            width: `${note.size}px`,
                            height: `${note.size}px`,

                        }}
                    />
                );
            })}
        </div>
    );
};

export default MusicBackground;
