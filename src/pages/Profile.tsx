import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Phone, Mail, Award, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    whatsappNumber: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        whatsappNumber: profile.whatsappNumber || "",
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: formData.displayName,
        whatsappNumber: formData.whatsappNumber,
        updatedAt: new Date(),
      });
      toast.success("Profile updated elegantly!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      {/* Left Sidebar */}
      <div className="md:w-1/3 flex flex-col items-center">
        <div className="relative group mb-8">
          <div className="w-48 h-48 rounded-full border border-[var(--border)] p-2 overflow-hidden glass group-hover:scale-105 transition-all duration-700">
            <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
               <User className="w-24 h-24 text-[var(--gold)]" />
            </div>
          </div>
          {profile?.role === 'admin' && (
             <Badge className="absolute bottom-4 right-4 bg-[var(--gold)] text-black border-none px-4 py-1 font-black shadow-lg">STORE OWNER</Badge>
          )}
        </div>
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{formData.displayName || "Alexander Vane"}</h2>
        <p className="text-[var(--text-dim)] flex items-center gap-2 mb-10"><Mail className="w-4 h-4" /> {user?.email}</p>
        
        <div className="w-full space-y-4">
          <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
             <div className="w-10 h-10 rounded-full bg-white/5 border border-[var(--border)] flex items-center justify-center">
                <CheckCircle className="text-[var(--gold)] w-5 h-5" />
             </div>
             <div>
               <p className="text-white font-bold text-sm uppercase tracking-tight">Verified Boutique</p>
               <p className="text-[var(--text-dim)] text-[10px] uppercase font-bold opacity-60 tracking-wider">Identity Confirmed</p>
             </div>
          </div>
          <div className="glass p-5 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
             <div className="w-10 h-10 rounded-full bg-white/5 border border-[var(--border)] flex items-center justify-center">
                <Award className="text-[var(--gold)] w-5 h-5" />
             </div>
             <div>
               <p className="text-white font-bold text-sm uppercase tracking-tight">Elite Tier Status</p>
               <p className="text-[var(--text-dim)] text-[10px] uppercase font-bold opacity-60 tracking-wider">Market Participant</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 max-w-2xl">
        <Card className="glass border-[var(--border)] shadow-2xl p-4">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Account Oversight</CardTitle>
            <CardDescription className="text-[var(--text-dim)] text-xs uppercase tracking-[1px] font-bold">Refine your presentation and contact protocols.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">Public Handle</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]/40" />
                  <Input 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="e.g. Master Curated" 
                    className="bg-[var(--glass)] border-[var(--border)] h-12 pl-12 rounded-xl focus:border-[var(--gold)] text-white placeholder:text-[var(--text-dim)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">WhatsApp Secure Line</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]/40" />
                  <Input 
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                    placeholder="e.g. +1234567890" 
                    className="bg-[var(--glass)] border-[var(--border)] h-12 pl-12 rounded-xl focus:border-[var(--gold)] text-white placeholder:text-[var(--text-dim)]"
                  />
                </div>
                <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-wider font-bold opacity-40 mt-2">Required for buyer engagement protocols.</p>
              </div>

              <Separator className="bg-[var(--border)] !my-10" />

              <Button disabled={loading} type="submit" className="w-full h-14 bg-[var(--gold)] text-black hover:bg-[var(--gold-dark)] font-black uppercase text-xs tracking-[2px] rounded-xl transition-all active:scale-[0.98]">
                {loading ? "Synchronizing..." : "Update Credentials"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
