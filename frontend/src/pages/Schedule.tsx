import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Clock, Trash2, ToggleLeft, ToggleRight, Music } from 'lucide-react'

type Song = {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
}

type Schedule = {
    _id: string;
    song: Song;
    scheduledTime: string;
    isActive: boolean;
}

const Schedule = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSchedules = async () => {
        try {
            const res = await axios.get(
                "http://localhost:3000/schedule/get-schedule",
                { withCredentials: true }
            )
            setSchedules(res.data.schedules)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedules()
    }, [])

    const handleToggle = async (schedule: Schedule) => {
        try {
            // ✅ if activating a past schedule, auto reschedule to tomorrow same time
            if (!schedule.isActive && new Date(schedule.scheduledTime) < new Date()) {
                const oldTime = new Date(schedule.scheduledTime)
                const newTime = new Date()
                newTime.setDate(newTime.getDate() + 1) // next day
                newTime.setHours(oldTime.getHours())   // same hour
                newTime.setMinutes(oldTime.getMinutes()) // same minute
                newTime.setSeconds(0)

                await axios.put(
                    `http://localhost:3000/schedule/update-schedule/${schedule._id}`,
                    { scheduledTime: newTime },
                    { withCredentials: true }
                )

                // ✅ also toggle to active
                await axios.patch(
                    `http://localhost:3000/schedule/toggle/${schedule._id}`,
                    {},
                    { withCredentials: true }
                )

                toast.success(`Rescheduled to tomorrow at ${oldTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                })} ✅`)
                fetchSchedules()
                return
            }

            // normal toggle
            const res = await axios.patch(
                `http://localhost:3000/schedule/toggle/${schedule._id}`,
                {},
                { withCredentials: true }
            )
            toast.success(res.data.msg)
            fetchSchedules()
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to toggle")
        }
    }

    const handleDelete = async (scheduleId: string) => {
        try {
            await axios.delete(
                `http://localhost:3000/schedule/delete-schedule/${scheduleId}`,
                { withCredentials: true }
            )
            toast.success("Schedule deleted!")
            fetchSchedules()
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to delete")
        }
    }

    const formatTime = (time: string) => {
        return new Date(time).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })
    }

    const isPast = (time: string) => new Date(time) < new Date()

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Clock size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">My Schedules</h1>
                    <p className="text-gray-400">Songs scheduled to play automatically</p>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Empty */}
            {!loading && schedules.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Music size={48} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No schedules yet</p>
                    <p className="text-gray-600 text-sm mt-1">Schedule songs from the Home or Playlist page</p>
                </div>
            )}

            {/* Schedules List */}
            {!loading && schedules.length > 0 && (
                <div className="space-y-4 max-w-2xl">
                    {schedules.map((schedule) => (
                        <div
                            key={schedule._id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${schedule.isActive
                                    ? "bg-gray-800 border-green-500/30"
                                    : "bg-gray-800/50 border-gray-700 opacity-60"
                                }`}
                        >
                            {/* Song Image */}
                            <img
                                src={schedule.song?.imageUrl || "https://via.placeholder.com/50"}
                                alt={schedule.song?.title}
                                className="w-14 h-14 rounded-xl object-cover"
                            />

                            {/* Song Info */}
                            <div className="flex-1">
                                <p className="text-white font-semibold">{schedule.song?.title}</p>
                                <p className="text-gray-400 text-sm">{schedule.song?.artist}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Clock size={12} className={isPast(schedule.scheduledTime) && !schedule.isActive ? "text-red-400" : "text-green-400"} />
                                    <p className={`text-xs ${isPast(schedule.scheduledTime) && !schedule.isActive ? "text-red-400" : "text-green-400"}`}>
                                        {formatTime(schedule.scheduledTime)}
                                        {/* ✅ show past label */}
                                        {isPast(schedule.scheduledTime) && !schedule.isActive && (
                                            <span className="ml-2 text-orange-400">(past — will reschedule to tomorrow)</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${schedule.isActive
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-600/20 text-gray-500"
                                }`}>
                                {schedule.isActive ? "Active" : "Inactive"}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {/* Toggle */}
                                <button
                                    onClick={() => handleToggle(schedule)}  // ✅ pass full schedule
                                    className="p-2 rounded-full hover:bg-white/10 transition"
                                    title={schedule.isActive ? "Deactivate" : "Activate"}
                                >
                                    {schedule.isActive
                                        ? <ToggleRight size={24} className="text-green-500" />
                                        : <ToggleLeft size={24} className="text-gray-500" />
                                    }
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(schedule._id)}
                                    className="p-2 rounded-full hover:bg-red-500/10 transition"
                                    title="Delete"
                                >
                                    <Trash2 size={18} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Schedule