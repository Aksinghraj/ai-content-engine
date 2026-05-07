import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Trash2, Edit2, Sparkles, Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const MOCK_CALENDAR_EVENTS = [
  { date: 5, title: "Twitter Thread: AI Tips", platform: "twitter", time: "10:00 AM" },
  { date: 8, title: "LinkedIn Article", platform: "linkedin", time: "2:00 PM" },
  { date: 12, title: "Instagram Carousel", platform: "instagram", time: "6:00 PM" },
  { date: 15, title: "YouTube Video", platform: "youtube", time: "3:00 PM" },
  { date: 18, title: "TikTok Trend", platform: "tiktok", time: "7:00 PM" },
  { date: 22, title: "Email Newsletter", platform: "email", time: "9:00 AM" },
  { date: 25, title: "Blog Post", platform: "blog", time: "11:00 AM" },
];

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "bg-blue-500",
  linkedin: "bg-blue-700",
  instagram: "bg-pink-500",
  youtube: "bg-red-500",
  tiktok: "bg-black",
  email: "bg-gray-600",
  blog: "bg-purple-500",
};

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const getEventsForDate = (date: number) => {
    return MOCK_CALENDAR_EVENTS.filter((event) => event.date === date);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold">Content Calendar</h1>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
          <p className="text-slate-400">Plan and schedule your content across all platforms</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={handlePrevMonth} className="border-slate-600">
                  ← Prev
                </Button>
                <h2 className="text-2xl font-semibold">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <Button variant="outline" onClick={handleNextMonth} className="border-slate-600">
                  Next →
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center font-semibold text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square bg-slate-800/30 rounded-lg" />
                ))}
                {days.map((day) => {
                  const events = getEventsForDate(day);
                  const isSelected = selectedDate === day;
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`aspect-square p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-600 border-2 border-blue-400"
                          : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
                      }`}
                    >
                      <div className="text-sm font-semibold mb-1">{day}</div>
                      <div className="space-y-0.5">
                        {events.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1.5 py-0.5 rounded ${PLATFORM_COLORS[event.platform]} text-white truncate`}
                          >
                            {event.platform}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-xs text-slate-400 px-1.5">+{events.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-800 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-slate-300 mb-2">Post Twitter thread on Mondays at 10 AM</p>
                  <p className="text-xs text-slate-400">Best engagement for tech topics</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-slate-300 mb-2">LinkedIn posts on Tuesdays & Thursdays</p>
                  <p className="text-xs text-slate-400">B2B audience most active</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-slate-300 mb-2">Instagram Reels on Fridays at 6 PM</p>
                  <p className="text-xs text-slate-400">Weekend prep for maximum reach</p>
                </div>
              </div>
            </Card>

            {/* Selected Date Details */}
            {selectedDate && (
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {MONTHS[currentMonth]} {selectedDate}, {currentYear}
                </h3>
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event, idx) => (
                      <div key={idx} className="p-3 bg-slate-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-white">{event.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded text-white ${PLATFORM_COLORS[event.platform]}`}>
                            {event.platform}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-xs">
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-xs">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400 mb-3">No posts scheduled</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Post
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Stats */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h3 className="text-lg font-semibold mb-4">Calendar Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Posts</span>
                  <span className="font-semibold text-white">{MOCK_CALENDAR_EVENTS.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">This Month</span>
                  <span className="font-semibold text-white">{MOCK_CALENDAR_EVENTS.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platforms</span>
                  <span className="font-semibold text-white">7</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
