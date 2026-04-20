import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Item } from "../types";
import { Trash2, Edit3, CheckCircle, Clock, ShoppingBag, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyPosts = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "items"), 
          where("sellerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyItems();
  }, [user]);

  const handleDelete = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "items", itemId));
      setItems(items.filter(item => item.id !== itemId));
      toast.success("Listing removed");
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  const toggleStatus = async (item: Item) => {
    const newStatus = item.status === 'available' ? 'sold' : 'available';
    try {
      await updateDoc(doc(db, "items", item.id), { status: newStatus });
      setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus as any } : i));
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-16 h-16 rounded-[2rem] glass border border-[var(--border)] animate-spin mb-4" />
      <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[4px] animate-pulse">Initializing Protocol</span>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Personal Gallery</h1>
          <p className="text-[var(--text-dim)] text-xs uppercase tracking-[2px] font-bold mt-2 opacity-60">Oversee your marketplace contributions</p>
        </div>
        <Link to="/sell" className="w-full sm:w-auto">
          <Button className="w-full bg-[var(--gold)] text-black font-black uppercase text-xs tracking-widest h-12 px-8 rounded-xl transition-transform active:scale-95 shadow-xl shadow-black/40">
             + New Acquisition Entry
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border-dashed">
          <ShoppingBag className="w-16 h-16 text-[var(--gold)]/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white uppercase mb-2">Registry is empty</h2>
          <p className="text-[var(--text-dim)] text-sm mb-10">Initialize your presence by posting an item for sale.</p>
          <Link to="/sell">
            <Button className="bg-[var(--gold)] text-black font-black uppercase text-xs tracking-widest h-12 px-10 rounded-xl">Post First Entry</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {items.map((item) => (
            <Card key={item.id} className="glass border-[var(--border)] overflow-hidden group hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-56 aspect-square relative bg-white/5 border-r border-white/5">
                  <img 
                    src={item.imageUrls[0] || "https://picsum.photos/seed/my-post/400/400"} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {item.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                      <Badge className="bg-red-600 text-white font-black px-4 py-1.5 rounded-full shadow-lg">SOLD</Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                       <h3 className="text-2xl font-black text-white group-hover:text-[var(--gold)] transition-colors uppercase tracking-tight italic">{item.name}</h3>
                       <div className="text-3xl font-black text-[var(--gold)]">${item.price.toLocaleString()}</div>
                    </div>
                    <p className="text-[var(--text-dim)] text-sm leading-relaxed line-clamp-2 max-w-2xl mb-6">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[2px] text-[var(--text-dim)] opacity-60">
                      <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Clock className="w-3.5 h-3.5" /> Registered: {item.createdAt?.toDate().toLocaleDateString()}</span>
                      <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><CheckCircle className="w-3.5 h-3.5" /> Status: {item.status}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-8">
                    <Link to={`/item/${item.id}`} className="min-w-[120px]">
                      <Button variant="outline" className="w-full border-[var(--border)] bg-black/20 text-white hover:bg-[var(--gold)] hover:text-black rounded-xl font-bold uppercase text-[10px] tracking-widest h-11 transition-all">
                        <Eye className="w-4 h-4 mr-2" /> Inspect
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => toggleStatus(item)}
                      variant="outline" 
                      className={`min-w-[160px] border-[var(--border)] bg-black/20 text-white hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest h-11 transition-all ${item.status === 'sold' ? "border-green-500/50 text-green-400" : ""}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> 
                      {item.status === 'available' ? "Archive as Sold" : "Reactivate Entry"}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl px-5 h-11 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass border-[var(--border)] shadow-2xl p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white text-xl font-black uppercase tracking-tight">Expunge Listing?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[var(--text-dim)] text-xs font-bold uppercase tracking-widest leading-relaxed opacity-60 mt-2">
                            This action is irreversible. The archival data for this entry will be permanently deleted from the marketplace matrix.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3">
                          <AlertDialogCancel variant="outline" size="default" className="bg-white/5 border-[var(--border)] text-white hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 flex-1">Retain Listing</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 text-white hover:bg-red-700 font-black uppercase text-[10px] tracking-widest h-12 flex-1 rounded-xl shadow-lg shadow-red-600/20"
                          >
                            Authorize Purge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
