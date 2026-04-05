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
    const COLS = 3;   // columns per side
    const ROWS = 6;   // rows per side
    const ICONS_PER_SIDE = COLS * ROWS; // 18 icons per side

    const [notes] = useState(() => {
        const result = [];

        for (let side = 0; side < 2; side++) {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const index = side * ICONS_PER_SIDE + row * COLS + col;

                    // Distribute evenly in each cell + small jitter
                    const cellWidth = 28 / COLS;
                    const cellHeight = 100 / ROWS;

                    const jitterX = (Math.random() - 0.5) * (cellWidth * 0.4);
                    const jitterY = (Math.random() - 0.5) * (cellHeight * 0.4);

                    const baseLeft = side === 0
                        ? col * cellWidth + cellWidth / 2   // left side: 0–28%
                        : 72 + col * cellWidth + cellWidth / 2; // right side: 72–100%

                    const baseBottom = row * cellHeight + cellHeight / 2;

                    result.push({
                        left: baseLeft + jitterX,
                        bottom: baseBottom + jitterY,
                        size: Math.random() * 20 + 25,
                        icon: icons[index % icons.length],
                        color: colors[index % colors.length],
                    });
                }
            }
        }

        return result;
    });

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