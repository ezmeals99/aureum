import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Item, UserProfile } from "../types";
import { MessageCircle, ShoppingCart, Heart, ChevronLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Separator } from "@/components/ui/separator";

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const itemSnap = await getDoc(doc(db, "items", id));
        if (itemSnap.exists()) {
          const itemData = { id: itemSnap.id, ...itemSnap.data() } as Item;
          setItem(itemData);
          
          const sellerSnap = await getDoc(doc(db, "users", itemData.sellerId));
          if (sellerSnap.exists()) {
            setSeller({ id: sellerSnap.id, ...sellerSnap.data() } as UserProfile);
          }

          if (user) {
            const q = query(collection(db, "wishlist"), where("userId", "==", user.uid), where("itemId", "==", id));
            const snap = await getDocs(q);
            setIsWishlisted(!snap.empty);
          }
        } else {
          toast.error("Item not found");
          navigate("/");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading item");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const handleWhatsApp = () => {
    if (!seller?.whatsappNumber) {
      toast.error("Seller hasn't provided a contact number");
      return;
    }
    const message = encodeURIComponent(`Hello! I'm interested in buying your item "${item?.name}" listed for $${item?.price}. Is it still available?`);
    window.open(`https://wa.me/${seller.whatsappNumber}?text=${message}`, "_blank");
  };

  const toggleWishlist = async () => {
    if (!user) return toast.error("Log in to save items");
    try {
      const q = query(collection(db, "wishlist"), where("userId", "==", user.uid), where("itemId", "==", id!));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "wishlist"), { userId: user.uid, itemId: id!, createdAt: new Date() });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      } else {
        await deleteDoc(snap.docs[0].ref);
        setIsWishlisted(false);
        toast.info("Removed from wishlist");
      }
    } catch (error) { toast.error("Error updating wishlist"); }
  };

  const addToCart = async () => {
    if (!user) return toast.error("Log in to shop");
    if (item?.status === 'sold') return toast.error("Item is already sold");
    try {
      const q = query(collection(db, "cart"), where("userId", "==", user.uid), where("itemId", "==", id!));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "cart"), { userId: user.uid, itemId: id!, quantity: 1, createdAt: new Date() });
      }
      toast.success("Added to cart");
    } catch (error) { toast.error("Error adding to cart"); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-16 h-16 rounded-[2rem] glass border border-[var(--border)] animate-spin mb-4" />
      <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[4px] animate-pulse">Initializing Protocol</span>
    </div>
  );
  if (!item) return null;

  return (
    <div className="container mx-auto px-6 lg:px-10 py-10 max-w-7xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-[var(--gold)] hover:bg-[var(--glass)] mb-8 border border-[var(--border)] rounded-full px-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Market
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden border border-gold/10 bg-gold/5 relative group">
            <img 
              src={item.imageUrls[activeImage] || "https://picsum.photos/seed/item/800/800"} 
              alt={item.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {item.status === 'sold' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                <Badge className="bg-red-600 text-white text-4xl px-12 py-4 rounded-full font-black">SOLD</Badge>
              </div>
            )}
          </div>
          
          {item.imageUrls.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {item.imageUrls.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-24 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === i ? "border-gold scale-105" : "border-gold/10 hover:border-gold/40"}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--gold)]/60 text-sm">
              <Link to={`/?category=${item.categoryId}`} className="hover:text-[var(--gold)] transition-colors flex items-center gap-1 uppercase tracking-widest font-bold">
                <Tag className="w-3 h-3" /> Category Details
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight italic uppercase">{item.name}</h1>
            <div className="text-4xl font-black text-[var(--gold)] mt-4">
              ${item.price.toLocaleString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              onClick={handleWhatsApp} 
              className="flex-1 min-w-[200px] bg-[#25D366] hover:bg-[#20bd5c] text-white font-bold h-14 text-lg rounded-2xl shadow-lg shadow-[#25D366]/20 transition-transform active:scale-95"
            >
              <MessageCircle className="mr-2 h-6 w-6" /> WhatsApp Seller
            </Button>
            <Button 
              onClick={addToCart}
              disabled={item.status === 'sold'}
              variant="outline" 
              className="px-6 h-14 border-[var(--border)] bg-[var(--glass)] text-white hover:bg-[var(--gold)] hover:text-black rounded-2xl transition-all"
            >
              <ShoppingCart className="w-6 h-6" />
            </Button>
            <Button 
              onClick={toggleWishlist}
              variant="outline" 
              className={`px-6 h-14 rounded-2xl border-[var(--border)] backdrop-blur-md ${isWishlisted ? "bg-red-500 border-red-500 text-white" : "bg-[var(--glass)] text-white hover:bg-[var(--gold)] hover:text-black"}`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>

          <Separator className="bg-[var(--gold)]/10" />

          <div className="space-y-4 glass p-8 rounded-3xl">
            <h3 className="text-[var(--gold)] font-bold uppercase tracking-widest text-xs">Description</h3>
            <p className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap">
              {item.description || "No description provided."}
            </p>
          </div>

          <div className="glass p-8 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center border border-[var(--border)] p-1">
                <div className="w-full h-full rounded-full bg-[#222] flex items-center justify-center overflow-hidden">
                  <User className="text-[var(--gold)] w-7 h-7" />
                </div>
              </div>
              <div>
                <p className="text-[var(--gold)]/40 text-[10px] uppercase font-black tracking-widest">Store Owner</p>
                <p className="text-white font-bold text-xl uppercase tracking-tight">{seller?.displayName || "Anonymous"}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[var(--gold)]/40 text-[10px] uppercase font-black tracking-widest flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" /> List Date
              </p>
              <p className="text-white/80 font-bold">
                {item.createdAt?.toDate().toLocaleDateString() || "Recently"}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
             <Button variant="ghost" className="text-gold/40 hover:text-gold">
               <Share2 className="mr-2 h-4 w-4" /> Share this listing
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
