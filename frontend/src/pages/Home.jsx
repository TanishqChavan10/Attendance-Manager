import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, BarChart3, PieChart, Bell, CheckCircle2 } from "lucide-react";

const Home = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Scroll to top when the home page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden bg-background text-foreground selection:bg-primary/20">

      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow z-0 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-glow delay-1000 z-0 pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4 z-10 relative">
        <div className="h-8"></div> {/* Spacer where badge was */}

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Master Your <br className="md:hidden" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
            Academic Attendance
          </span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Stop worrying about attendance shortages. Track your classes, visualize your progress, and get smart reminders instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          {loading ? (
            <Button disabled className="h-14 px-8">Loading...</Button>
          ) : isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" className="rounded-full px-10 text-lg h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/40 border-0 transition-all hover:scale-105">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="lg" className="rounded-full px-10 h-14 bg-white text-indigo-950 hover:bg-indigo-50 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:scale-105 text-lg border-0">
                Get Started Free
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full">
        <FeatureCard
          icon={<BarChart3 className="h-10 w-10 text-indigo-400" />}
          title="Track Everything"
          description="Log every class with a single tap. Keep a precise record of your entire semester."
          delay="0ms"
        />
        <FeatureCard
          icon={<PieChart className="h-10 w-10 text-purple-400" />}
          title="Visual Insights"
          description="Beautiful charts show you exactly where you stand. Spot low attendance before it's too late."
          delay="100ms"
        />
        <FeatureCard
          icon={<Bell className="h-10 w-10 text-pink-400" />}
          title="Smart Reminders"
          description="Never miss a class again. Get automated notifications based on your personalized timetable."
          delay="200ms"
        />
      </div>

      {/* CTA Section */}
      <Card className="mt-24 w-full max-w-5xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden group rounded-3xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />

        <CardContent className="flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-8 relative z-10">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready to boost your grades?</h3>
            <p className="text-indigo-200 text-lg">Join thousands of students staying organized with Attendly.</p>
          </div>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" className="h-14 px-10 rounded-full bg-white text-indigo-950 hover:bg-indigo-50 font-bold shadow-xl transition-transform hover:scale-105 text-lg">
                Create Free Account
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-24 text-center text-sm text-slate-500 pb-8 z-10">
        <p>&copy; {new Date().getFullYear()} Attendly. Built for students, by students.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <Card className="bg-card/30 border-white/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group" style={{ animationDelay: delay }}>
    <CardHeader>
      <div className="mb-4 p-3 bg-white/5 w-fit rounded-xl group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-base">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

export default Home;
