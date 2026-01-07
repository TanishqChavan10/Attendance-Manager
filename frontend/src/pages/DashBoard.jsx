import { useContext } from "react";
import { TimetableContext } from "../context/TimetableContext";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, TrendingUp, Bell, Clock, CheckCircle2, XCircle, AlertCircle, Target } from "lucide-react";

const Dashboard = () => {
    const { user } = useAuth();
    const { getTodaysClasses, getAttendanceStats } = useContext(TimetableContext);

    const todaysClasses = getTodaysClasses() || [];
    const attendanceStats = getAttendanceStats() || { total: 0, attended: 0, percentage: 0 };
    const requiredPercentage = user?.requiredAttendancePercentage || 75;

    // Helper to get day name
    const getTodayDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-background pt-20 pb-12 px-4 sm:px-6">

           
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Welcome back,
                            </span>{" "}
                            <span className="text-indigo-400">
                                {user?.username || 'Student'}
                            </span>
                        </h1>
                        <p className="text-slate-400 mt-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {getTodayDate()}
                        </p>
                    </div>
                    {/* Optional Action Buttons could go here */}
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">

                    {/* Overall Attendance */}
                    <Card className="glass-panel border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                        <div className="absolute -right-6 -top-6 h-24 w-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Overall Attendance</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                                {attendanceStats.percentage.toFixed(1)}
                                <span className="text-sm font-normal text-slate-400">%</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                {attendanceStats.percentage >= requiredPercentage ? (
                                    <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        On Track
                                    </span>
                                ) : (
                                    <span className="flex items-center text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                        {(requiredPercentage - attendanceStats.percentage).toFixed(1)}% Below Target
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Classes Attended */}
                    <Card className="glass-panel border-purple-500/20 bg-purple-500/5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="absolute -right-6 -top-6 h-24 w-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Classes Attended</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <BookOpen className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {attendanceStats.attended}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Out of {attendanceStats.total} total classes
                            </p>
                        </CardContent>
                    </Card>

                    {/* Today's Classes */}
                    <Card className="glass-panel border-blue-500/20 bg-blue-500/5 relative overflow-hidden group hover:border-blue-500/40 transition-all">
                        <div className="absolute -right-6 -top-6 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Today's Classes</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {todaysClasses.length}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Scheduled for today
                            </p>
                        </CardContent>
                    </Card>

                    {/* Target Goal */}
                    <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                        <div className="absolute -right-6 -top-6 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Target Goal</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Target className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {requiredPercentage}%
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Minimum required attendance
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">

                    {/* Today's Schedule - Takes up 2/3 width on larger screens if we add a sidebar, for now full width or 2/3 */}
                    <div className="md:col-span-2">
                        <Card className="glass-panel border-white/10 h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white">Today's Schedule</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Mark your attendance for today's sessions
                                        </CardDescription>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <Clock className="h-5 w-5 text-indigo-400" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {todaysClasses.length > 0 ? (
                                    todaysClasses.map((cls, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300"
                                        >
                                            <div className="space-y-1 mb-4 sm:mb-0">
                                                <h4 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                    {cls.subject}
                                                </h4>
                                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                                    <span className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded text-xs border border-white/5">
                                                        <Clock className="h-3 w-3" />
                                                        {cls.time}
                                                    </span>
                                                    <span>•</span>
                                                    <span>Room {cls.room || 'TBA'}</span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant={cls.attended ? "outline" : "default"}
                                                className={`min-w-[100px] transition-all duration-300 ${cls.attended
                                                    ? "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                    }`}
                                            >
                                                {cls.attended ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Present
                                                    </>
                                                ) : (
                                                    "Mark Present"
                                                )}
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                            <Calendar className="h-10 w-10 text-slate-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">No Classes Today</h3>
                                        <p className="text-slate-400 max-w-sm">
                                            Enjoy your free day! Check your timetable to prepare for upcoming classes.
                                        </p>
                                        <Button variant="outline" className="mt-6 border-white/10 hover:bg-white/5">
                                            View Full Timetable
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions / Notifications - Right Sidebar */}
                    <div className="md:col-span-1 space-y-6">

                        {/* Quick Tips or Notifications */}
                        <Card className="glass-panel border-amber-500/20 bg-amber-500/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-amber-200 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Attendance Alert
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-slate-300">
                                    You need to attend next <span className="font-bold text-white">3 classes</span> of <span className="text-amber-300">DBMS</span> to reach your 75% target.
                                </p>
                            </CardContent>
                        </Card>

                        

                    </div>
                </div>
            </div>
        </div>
    );
};



export default Dashboard;
