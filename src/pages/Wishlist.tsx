import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Item } from "../types";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ItemGrid from "../components/items/ItemGrid";
import { toast } from "sonner";

const Wishlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "wishlist"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        
        const itemPromises = snap.docs.map(async (wishDoc) => {
          const itemSnap = await getDoc(doc(db, "items", wishDoc.data().itemId));
          if (itemSnap.exists()) {
            return { id: itemSnap.id, ...itemSnap.data() } as Item;
          }
          return null;
        });

        const results = await Promise.all(itemPromises);
        setItems(results.filter(i => i !== null) as Item[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-16 h-16 rounded-[2rem] glass border border-[var(--border)] animate-spin mb-4" />
      <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[4px] animate-pulse">Initializing Protocol</span>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <div className="mb-16">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-4">
          <Heart className="w-10 h-10 text-[var(--gold)] fill-[var(--gold)]" /> Saved Collections
        </h1>
        <p className="text-[var(--text-dim)] text-xs uppercase tracking-[2px] font-bold mt-2 opacity-60">Reserved excellence for future acquisition</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border-dashed">
          <Heart className="w-16 h-16 text-[var(--gold)]/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white uppercase mb-2">Vault is empty</h2>
          <p className="text-[var(--text-dim)] text-sm">Curate your legacy by saving items from the collections.</p>
        </div>
      ) : (
        <ItemGrid items={items} />
      )}
    </div>
  );
};

export default Wishlist;
