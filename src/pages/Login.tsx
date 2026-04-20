import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists, if not create it
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          email: user.email,
          role: "user",
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
      }

      toast.success("Welcome to Aura Market!");
      navigate("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-24 flex justify-center items-center min-h-[75vh]">
      <Card className="w-full max-w-md glass border-[var(--border)] text-white shadow-2xl p-4">
        <CardHeader className="text-center pb-10">
          <div className="w-20 h-20 rounded-[2.5rem] glass mx-auto mb-8 flex items-center justify-center border border-[var(--border)] shadow-xl shadow-black/40">
            <span className="text-[var(--gold)] font-black text-4xl italic">A</span>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">Elite Clearance</CardTitle>
          <CardDescription className="text-[var(--text-dim)] text-xs font-bold uppercase tracking-[3px] mt-3 opacity-60">
            Authenticate to engage with the collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-14 bg-white text-black hover:bg-gray-100 font-black uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-4 rounded-xl shadow-xl shadow-black/20 transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-80" />
            Sign In with Google
          </Button>
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>
          <p className="text-[9px] text-center text-[var(--text-dim)] uppercase tracking-widest leading-relaxed font-bold opacity-40">
            Authorized personnel only. Digital identity required for marketplace verification.
          </p>
        </CardContent>
        <CardFooter className="pt-6">
          <p className="text-[8px] text-center text-white/20 uppercase tracking-[2px] font-black">
            Access Protocol • Aura Elite Management
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
