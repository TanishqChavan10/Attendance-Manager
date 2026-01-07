import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, Calendar, PlusCircle, Home, GraduationCap } from "lucide-react";

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, children, icon: Icon }) => (
        <Link
            to={to}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${isActive(to)
                ? 'text-primary bg-primary/10 font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </Link>
    );

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled || mobileMenuOpen ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">
                        Attend<span className="text-indigo-400">ly</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <NavLink to="/" icon={Home}>Home</NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                            <NavLink to="/timetable" icon={Calendar}>Timetable</NavLink>
                            <NavLink to="/courses/add" icon={PlusCircle}>Add Course</NavLink>
                            <div className="w-px h-6 bg-border mx-2" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-px h-6 bg-border mx-2" />
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl absolute w-full p-4 space-y-4 shadow-2xl animate-accordion-down">
                    <div className="flex flex-col gap-2">
                        <NavLink to="/" icon={Home}>Home</NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                <NavLink to="/timetable" icon={Calendar}>Timetable</NavLink>
                                <NavLink to="/courses/add" icon={PlusCircle}>Add Course</NavLink>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start mt-4 gap-2"
                                    onClick={logout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Link to="/login">
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
