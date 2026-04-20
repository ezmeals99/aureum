import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Key, User } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials as requested
    if (username === "alexzzooo" && password === "2006") {
      localStorage.setItem("custom_admin_auth", "true");
      localStorage.setItem("admin_username", username);
      toast.success("Identity Verified. Access Granted.");
      // Force a page reload or state change. Navbar/App should observe this.
      window.location.href = "/admin"; 
    } else {
      toast.error("Invalid Administrative Credentials");
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-6 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
      
      <Card className="w-full max-w-md glass border-[var(--border)] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)] shadow-[0_0_20px_var(--gold)]" />
        
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto w-20 h-20 rounded-[2.5rem] glass border border-[var(--gold)]/20 flex items-center justify-center mb-6 shadow-xl shadow-gold/5">
             <ShieldAlert className="w-10 h-10 text-[var(--gold)]" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter italic italic">System Override</CardTitle>
          <CardDescription className="text-[var(--text-dim)] text-[10px] uppercase tracking-[3px] font-black mt-2">Administrative Clearance Required</CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-[var(--gold)] opacity-60 flex items-center gap-2 px-1">
                <User className="w-3 h-3" /> System ID
              </Label>
              <Input 
                required
                placeholder="Enter username..." 
                className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-[var(--gold)] text-lg font-bold placeholder:font-normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-[var(--gold)] opacity-60 flex items-center gap-2 px-1">
                <Key className="w-3 h-3" /> Access Code
              </Label>
              <Input 
                required
                type="password"
                placeholder="••••••••" 
                className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-[var(--gold)] text-lg tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-14 bg-[var(--gold)] text-black hover:bg-[var(--gold-dark)] rounded-2xl font-black uppercase text-[11px] tracking-[4px] mt-4 transition-all active:scale-[0.98] shadow-2xl shadow-gold/20">
              Verify Protocol
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
