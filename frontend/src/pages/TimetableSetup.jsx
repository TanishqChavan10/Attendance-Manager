import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TimetableContext } from "../context/TimetableContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, Clock, BookOpen, Calendar as CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TimetableSetup = () => {
  const { timetable, loading, saveEntireTimetable, loadTimetable } = useContext(TimetableContext);
  const [classes, setClasses] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  // Load existing timetable when component mounts
  useEffect(() => {
    loadTimetable();
  }, []);

  // Update local state when timetable from context changes
  useEffect(() => {
    if (timetable && timetable.classes) {
      setClasses([...timetable.classes]);
    }
  }, [timetable]);

  const handleAddClass = (day) => {
    const newClass = { day, subject: "", time: "", isNew: true };
    setClasses([...classes, newClass]);
    setHasChanges(true);
  };

  const handleRemoveClass = (index) => {
    const newClasses = [...classes];
    newClasses.splice(index, 1);
    setClasses(newClasses);
    setHasChanges(true);
  };

  const handleUpdateClass = (index, field, value) => {
    const newClasses = [...classes];
    newClasses[index][field] = value;
    setClasses(newClasses);
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validation
    const isValid = classes.every(c =>
      c.subject.trim() !== "" &&
      c.time.trim() !== "" &&
      DAYS.includes(c.day)
    );

    if (!isValid) {
      toast.error("Please fill in all subject and time fields");
      return;
    }

    // Clean up data (remove isNew flag)
    const cleanedClasses = classes.map(({ isNew, ...c }) => c);

    const success = await saveEntireTimetable(cleanedClasses);
    if (success) {
      toast.success("Timetable saved successfully");
      setHasChanges(false);
      navigate("/dashboard");
    }
  };

  const getClassesForDay = (day) => {
    return classes
      .map((c, index) => ({ ...c, originalIndex: index }))
      .filter(c => c.day === day)
      .sort((a, b) => {
        // Simple sort by time string (can be improved with real time parsing)
        return a.time.localeCompare(b.time);
      });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Manage Timetable
            </h1>
            <p className="text-slate-400">
              Organize your weekly schedule efficiently
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-slate-300 w-full md:w-auto"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className={`min-w-[140px] w-full md:w-auto ${hasChanges
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Days Layout - Single Column (Full Width) */}
        <div className="flex flex-col gap-6">
          {DAYS.map((day) => {
            const dayClasses = getClassesForDay(day);

            return (
              <Card key={day} className="glass-panel border-white/5 bg-black/20 overflow-hidden flex flex-col group hover:border-indigo-500/30 transition-all duration-300">
                <CardHeader className="bg-white/5 border-b border-white/5 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-3">
                    {day}
                    <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                      {dayClasses.length} {dayClasses.length === 1 ? 'Class' : 'Classes'}
                    </span>
                  </CardTitle>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    onClick={() => handleAddClass(day)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Class
                  </Button>
                </CardHeader>

                <CardContent className="p-6">
                  {dayClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 min-h-[100px] border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                      <span className="text-sm">No classes scheduled for {day}</span>
                    </div>
                  ) : (
                    // Grid for classes within the day row
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {dayClasses.map((cls) => (
                        <div
                          key={cls.originalIndex}
                          className="group/item relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                        >
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <BookOpen className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                                <Input
                                  value={cls.subject}
                                  onChange={(e) => handleUpdateClass(cls.originalIndex, 'subject', e.target.value)}
                                  placeholder="Subject Name"
                                  className="h-9 text-sm bg-black/20 border-transparent focus:border-indigo-500/50 hover:bg-black/30 placeholder:text-slate-600 font-medium text-white"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                <Input
                                  value={cls.time}
                                  onChange={(e) => handleUpdateClass(cls.originalIndex, 'time', e.target.value)}
                                  placeholder="Time (e.g. 9:00 AM)"
                                  className="h-9 text-sm bg-black/20 border-transparent focus:border-purple-500/50 hover:bg-black/30 placeholder:text-slate-600 text-slate-300"
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveClass(cls.originalIndex)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500/20 text-rose-400 opacity-0 group-hover/item:opacity-100 hover:bg-rose-500 hover:text-white transition-all duration-200 shadow-sm"
                            title="Remove Class"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimetableSetup;
