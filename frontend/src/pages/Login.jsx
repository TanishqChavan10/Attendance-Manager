import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Lock, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const { login, error: authError, loading, isAuthenticated } = useAuth();
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.username || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            await login(formData);
            // Navigation handled by useEffect
        } catch (err) {
            toast.error(err.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 ring-4 ring-white/5">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400 mt-2">Enter your credentials to access your account</p>
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
                                <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Label htmlFor="password" className="text-slate-300 group-focus-within:text-indigo-400 transition-colors">Password</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-indigo-500/50 focus:bg-black/30 transition-all h-11 text-slate-100 placeholder:text-slate-600"
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-8" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-400 pt-6 border-t border-white/10">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline underline-offset-4">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
