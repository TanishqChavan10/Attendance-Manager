import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, User, Lock, GraduationCap, Target, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        requiredAttendancePercentage: 75
    });
    const [error, setError] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const { register, error: authError, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
        if (authError) {
            setError(authError);
        }
    }, [isAuthenticated, authError, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'password') {
            checkPasswordStrength(value);
        }
        if (error) setError(null);
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length > 5) strength += 1;
        if (password.length > 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
        if (passwordStrength < 2) return 'bg-red-500';
        if (passwordStrength < 4) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.username.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }

        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (!result.success) {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">

            <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 ring-4 ring-white/5">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Join Attend<span className="text-indigo-400">ly</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Start tracking your academic journey today</p>
                    </div>
                </div>

                {/* Form Content - No Card Wrapper */}
                <div className="w-full space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">


                        <div className="space-y-2 group">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Label htmlFor="username" className="text-slate-300 group-focus-within:text-indigo-400 transition-colors">Username</Label>
                            </div>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:bg-black/30 transition-all h-11 text-slate-100 placeholder:text-slate-600"
                            />
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Label htmlFor="email" className="text-slate-300 group-focus-within:text-indigo-400 transition-colors">Email</Label>
                            </div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:bg-black/30 transition-all h-11 text-slate-100 placeholder:text-slate-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 group">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Label htmlFor="password" className="text-slate-300 group-focus-within:text-indigo-400 transition-colors">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:bg-black/30 transition-all h-11 text-slate-100 placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <Label htmlFor="confirmPassword" className="text-slate-300 group-focus-within:text-indigo-400 transition-colors">Confirm</Label>
                                </div>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:bg-black/30 transition-all h-11 text-slate-100 placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {formData.password && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 text-right">
                                    Password Strength: <span className="font-medium text-slate-300">{passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Medium' : 'Strong'}</span>
                                </p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2 group">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="attendance" className="text-slate-300 pl-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                                    <Target className="h-4 w-4" /> Target Attendance Goal
                                </Label>
                                <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-sm border border-indigo-500/20">{formData.requiredAttendancePercentage}%</span>
                            </div>
                            <input
                                type="range"
                                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                min="0"
                                max="100"
                                name="requiredAttendancePercentage"
                                value={formData.requiredAttendancePercentage}
                                onChange={handleChange}
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-8" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-400 pt-6 border-t border-white/10">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline underline-offset-4">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
