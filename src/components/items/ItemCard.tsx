import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Item } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "sonner";

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const checkWishlist = async () => {
        const q = query(collection(db, "wishlist"), where("userId", "==", user.uid), where("itemId", "==", item.id));
        const snap = await getDocs(q);
        setIsWishlisted(!snap.empty);
      };
      checkWishlist();
    }
  }, [user, item.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save items");
      return;
    }

    try {
      const q = query(collection(db, "wishlist"), where("userId", "==", user.uid), where("itemId", "==", item.id));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(collection(db, "wishlist"), {
          userId: user.uid,
          itemId: item.id,
          createdAt: new Date()
        });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      } else {
        await deleteDoc(snap.docs[0].ref);
        setIsWishlisted(false);
        toast.info("Removed from wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }

    try {
      const q = query(collection(db, "cart"), where("userId", "==", user.uid), where("itemId", "==", item.id));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(collection(db, "cart"), {
          userId: user.uid,
          itemId: item.id,
          quantity: 1,
          createdAt: new Date()
        });
      } else {
        // Increment quantity? For marketplace maybe just 1 is enough, but I'll stick to 1
      }
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Card className="group relative glass overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col h-full rounded-2xl shadow-xl shadow-black/20">
      <Link to={`/item/${item.id}`} className="block flex-grow">
        <div className="relative aspect-square overflow-hidden bg-[var(--glass)]">
          <img 
            src={item.imageUrls[0] || "https://picsum.photos/seed/placeholder/400/400"} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleWishlist}
              className={`rounded-full backdrop-blur-md border ${isWishlisted ? "bg-red-500 border-red-500 text-white" : "bg-black/30 border-[var(--border)] text-white hover:bg-[var(--gold)] hover:text-black"}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>
          {item.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center">
              <Badge className="bg-red-600/80 text-white text-lg px-6 py-2 rounded-full font-black border-none scale-110 shadow-lg">SOLD</Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-5 flex-grow">
          <div className="text-[var(--gold)] text-[22px] font-bold mb-1">
            ${item.price.toLocaleString()}
          </div>
          <h3 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-[var(--gold)] transition-colors mb-1">{item.name}</h3>
          <p className="text-[var(--text-dim)] text-xs line-clamp-2 leading-relaxed">
            {item.description || "No description provided."}
          </p>
        </CardContent>
      </Link>

      <CardFooter className="p-5 pt-0 gap-2">
        <Button 
          onClick={addToCart}
          disabled={item.status === 'sold'}
          className="flex-1 bg-white/5 hover:bg-[var(--gold)] text-white hover:text-black border border-[var(--border)] font-bold h-11 rounded-xl transition-all duration-300 group-hover:bg-[var(--gold)] group-hover:text-black"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
