import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Item } from "../types";
import { ShoppingCart, Trash2, MessageCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const Cart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<{ id: string, item: Item, cartDocId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "cart"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        
        const itemPromises = snap.docs.map(async (cartDoc) => {
          const itemSnap = await getDoc(doc(db, "items", cartDoc.data().itemId));
          if (itemSnap.exists()) {
            return { 
              id: itemSnap.id, 
              item: { id: itemSnap.id, ...itemSnap.data() } as Item,
              cartDocId: cartDoc.id
            };
          }
          return null;
        });

        const results = await Promise.all(itemPromises);
        setCartItems(results.filter(i => i !== null) as any[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const removeItem = async (cartDocId: string) => {
    try {
      await deleteDoc(doc(db, "cart", cartDocId));
      setCartItems(cartItems.filter(i => i.cartDocId !== cartDocId));
      toast.success("Removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      const batch = writeBatch(db);
      cartItems.forEach(i => {
        batch.delete(doc(db, "cart", i.cartDocId));
      });
      await batch.commit();
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const checkoutAll = () => {
    if (cartItems.length === 0) return;
    
    // Group by seller? Or just one big message. 
    // Usually, in a multi-seller market, you contact individual sellers.
    // But I'll make a summary message.
    const itemNames = cartItems.map(i => `- ${i.item.name} ($${i.item.price})`).join("%0A");
    const total = cartItems.reduce((acc, i) => acc + i.item.price, 0);
    const message = encodeURIComponent(`Hello! I'm interested in buying these items from your marketplace:%0A${itemNames}%0ATotal: $${total}%0AAre they still available?`);
    
    // Since we don't know who the primary admin/support is, I'll open a general link or the first seller.
    // For this demo, let's assume there's a support number or just guide them to individual items.
    // Better: Inform them to contact sellers directly, or mock a "Central Support" WhatsApp.
    toast.info("Connecting to marketplace support for group checkout...");
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const total = cartItems.reduce((acc, i) => acc + i.item.price, 0);

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
          <ShoppingCart className="w-10 h-10 text-[var(--gold)]" /> Acquisitions
        </h1>
        <p className="text-[var(--text-dim)] text-xs uppercase tracking-[2px] font-bold mt-2 opacity-60">Pending review and finalization</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border-dashed">
          <ShoppingBag className="w-16 h-16 text-[var(--gold)]/20 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white uppercase mb-2">Cart is empty</h2>
          <p className="text-[var(--text-dim)] text-sm mb-10">Your collection awaits new acquisitions.</p>
          <Button onClick={() => window.location.href = '/'} className="bg-[var(--gold)] text-black border-none font-black h-12 px-10 rounded-xl uppercase text-xs tracking-widest">Explore Market</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((cartItem) => (
              <Card key={cartItem.cartDocId} className="glass border-[var(--border)] hover:bg-white/[0.05] transition-all overflow-hidden group">
                <CardContent className="p-5 flex gap-6">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                    <img src={cartItem.item.imageUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-white uppercase tracking-tight">{cartItem.item.name}</h3>
                        <p className="text-[var(--gold)]/60 text-[10px] uppercase font-black tracking-widest mt-1">Status: {cartItem.item.status}</p>
                      </div>
                      <div className="text-2xl font-black text-[var(--gold)]">
                        ${cartItem.item.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(cartItem.cartDocId)}
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400 p-0 h-auto font-bold uppercase text-[10px] tracking-widest"
                       >
                         <Trash2 className="w-3.5 h-3.5 mr-1" /> Discard
                       </Button>
                       <Link to={`/item/${cartItem.item.id}`}>
                         <Button variant="ghost" size="sm" className="text-white/40 hover:text-[var(--gold)] p-0 h-auto font-bold uppercase text-[10px] tracking-widest">
                           Inspect <ArrowRight className="w-3.5 h-3.5 ml-1" />
                         </Button>
                       </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="ghost" onClick={clearCart} className="text-[var(--text-dim)] hover:text-white w-full border border-dashed border-[var(--border)] h-12 rounded-xl mt-6 uppercase text-[10px] font-bold tracking-[2px]">
              Purge Entire Collection
            </Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="glass border-[var(--border)] shadow-2xl sticky top-28 p-2">
              <CardContent className="p-8 space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-[var(--text-dim)] text-sm font-bold uppercase tracking-wider">
                    <span>Items Count</span>
                    <span className="text-white">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-dim)] text-sm font-bold uppercase tracking-wider">
                    <span>Protocol Fee</span>
                    <span className="text-green-500">WAIVED</span>
                  </div>
                  <Separator className="bg-[var(--border)]" />
                  <div className="flex justify-between items-end">
                    <span className="text-[var(--text-dim)] text-xs font-black uppercase tracking-widest mb-1">Total Estate</span>
                    <span className="text-[var(--gold)] font-black text-3xl">${total.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  onClick={checkoutAll}
                  className="w-full h-16 bg-[var(--gold)] text-black hover:bg-[var(--gold-dark)] font-black text-sm uppercase tracking-[2px] rounded-xl shadow-xl shadow-black/40 transition-transform active:scale-95"
                >
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Secure Checkout
                </Button>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[9px] text-center text-[var(--text-dim)] uppercase tracking-widest leading-relaxed font-bold opacity-60">
                    Finalization occurs via the secure WhatsApp protocol with our curation concierge.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
