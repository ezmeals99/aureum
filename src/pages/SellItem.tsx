import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Category } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, X, Upload, IndianRupee, DollarSign } from "lucide-react";

const SellItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    };
    fetchCategories();
  }, []);

  const addImage = () => {
    if (newImageUrl.trim() && imageUrls.length < 10) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (imageUrls.length >= 10) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageUrls(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.categoryId) return toast.error("Please select a category");
    if (imageUrls.length === 0) return toast.error("Please add at least one image URL");

    setLoading(true);
    try {
      const itemData = {
        sellerId: user.uid,
        name: formData.name,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        description: formData.description,
        imageUrls: imageUrls,
        status: "available",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "items"), itemData);
      
      // Update the document to include the ID inside the data if needed (rules often need it)
      await setDoc(doc(db, "items", docRef.id), { ...itemData, id: docRef.id });

      toast.success("Listing created successfully!");
      navigate("/my-posts");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center max-w-4xl">
      <Card className="w-full glass border-[var(--border)] text-white shadow-2xl p-4">
        <CardHeader className="border-b border-white/5 pb-10">
          <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">NEW LISTING</CardTitle>
          <CardDescription className="text-[var(--text-dim)] text-xs uppercase tracking-[2px] font-bold mt-2">Initialize marketplace engagement with item details.</CardDescription>
        </CardHeader>
        <CardContent className="pt-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">NAME OF PRODUCT</Label>
                <Input 
                  required
                  placeholder="e.g. Imperial Timepiece" 
                  className="bg-[var(--glass)] border-[var(--border)] h-12 rounded-xl focus:border-[var(--gold)]"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">Valuation ($)</Label>
                <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]/40" />
                   <Input 
                    required
                    type="number"
                    placeholder="0.00" 
                    className="bg-[var(--glass)] border-[var(--border)] h-12 pl-12 rounded-xl focus:border-[var(--gold)]"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">Classification</Label>
              <Select onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                <SelectTrigger className="bg-[var(--glass)] border-[var(--border)] h-12 rounded-xl focus:border-[var(--gold)]">
                  <SelectValue placeholder="Identify category" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-[var(--border)] text-white">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="focus:bg-[var(--gold)] focus:text-black uppercase text-xs font-bold">{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">DESCRIPTION</Label>
              <Textarea 
                required
                placeholder="add some description about your product" 
                className="bg-[var(--glass)] border-[var(--border)] min-h-[180px] rounded-2xl focus:border-[var(--gold)] p-4 leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-6">
              <Label className="text-[var(--gold)] font-bold uppercase text-[10px] tracking-[2px] opacity-80">Add Images</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-widest mb-1 opacity-50 font-bold">Paste URL</p>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Insert high-resolution URL..." 
                      className="bg-[var(--glass)] border-[var(--border)] h-12 rounded-xl focus:border-[var(--gold)] flex-grow"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                    <Button type="button" onClick={addImage} className="bg-white/10 hover:bg-[var(--gold)] border border-[var(--border)] h-12 px-6 rounded-xl transition-all group">
                      <Plus className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-widest mb-1 opacity-50 font-bold">Local Upload</p>
                  <div className="relative">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      onChange={handleFileUpload}
                    />
                    <div className="bg-[var(--glass)] border border-dashed border-[var(--border)] h-12 rounded-xl flex items-center justify-center gap-2 group-hover:bg-white/5 transition-all">
                       <Upload className="w-4 h-4 text-[var(--gold)]" />
                       <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Select from device</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden glass border-white/5 group">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-md text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {imageUrls.length === 0 && (
                <div className="glass border-dashed border-white/10 rounded-2xl py-12 flex flex-col items-center justify-center text-white/20">
                  <Upload className="w-10 h-10 mb-4 opacity-50" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Multi-image presentation required</p>
                </div>
              )}
            </div>

            <div className="pt-10">
              <Button type="submit" disabled={loading} className="w-full h-16 bg-transparent border border-[var(--gold)] text-white hover:bg-[var(--gold)] hover:text-black font-black uppercase text-[11px] tracking-[4px] px-8 rounded-xl transition-all active:scale-95 shadow-xl shadow-gold/20">
                {loading ? "Initializing..." : "Authorize Publication"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellItem;
