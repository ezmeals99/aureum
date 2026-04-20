import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Item, Category } from "../types";
import { Search, Filter, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ItemGrid from "../components/items/ItemGrid";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "items"), orderBy("createdAt", "desc"));
        
        if (currentCategory) {
          q = query(collection(db, "items"), where("categoryId", "==", currentCategory), orderBy("createdAt", "desc"));
        }

        const snap = await getDocs(q);
        let fetchedItems = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));

        // Sort by Pinned status first, then by date (date is already handled by query order mostly, but we re-sort for pinning)
        fetchedItems.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });

        // Client side search for text
        if (searchQuery) {
          fetchedItems = fetchedItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [currentCategory, searchQuery]);

  const handleCategoryClick = (categoryId: string | null) => {
    if (!categoryId) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-70px)]">
      {/* Left Sidebar - Categories */}
      <aside className="hidden lg:flex w-[240px] flex-col gap-8 p-8 border-r border-[var(--border)] bg-black/20 backdrop-blur-sm sticky top-[70px] h-[calc(100vh-70px)]">
        <div>
          <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--gold)] opacity-80 mb-6 font-bold">Collections</h3>
          <nav className="flex flex-col">
            <button 
              onClick={() => handleCategoryClick(null)}
              className={`py-3 text-sm text-left border-b border-white/5 transition-all ${!currentCategory ? "text-[var(--gold)] font-bold opacity-100" : "text-white opacity-60 hover:opacity-100"}`}
            >
              All Collections
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`py-3 text-sm text-left border-b border-white/5 transition-all ${currentCategory === cat.id ? "text-[var(--gold)] font-bold opacity-100" : "text-white opacity-60 hover:opacity-100"}`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {searchQuery ? `Results for "${searchQuery}"` : currentCategory ? categories.find(c => c.id === currentCategory)?.name : "Latest Listings"}
          </h1>
          <Link to="/sell" className="lg:hidden">
            <Button className="bg-[var(--gold)] text-black font-bold h-10 px-6 rounded-lg">
              + Sell Item
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square glass rounded-2xl animate-pulse flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[var(--gold)]/20" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center glass rounded-3xl border-dashed">
            <ShoppingBag className="w-16 h-16 text-[var(--gold)]/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--gold)]">No items found</h3>
            <p className="text-[var(--text-dim)]">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <ItemGrid items={items} />
        )}
      </main>

      {/* Right Sidebar - Design Pattern */}
      <aside className="hidden xl:flex w-[280px] flex-col gap-10 p-8 border-l border-[var(--border)] bg-black/20 backdrop-blur-sm sticky top-[70px] h-[calc(100vh-70px)]">
        <div>
          <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--gold)] opacity-80 mb-6 font-bold">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
             <Button variant="outline" className="border-[var(--border)] bg-[var(--glass)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black rounded-lg text-xs">Recently Added</Button>
             <Button variant="outline" className="border-[var(--border)] bg-[var(--glass)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black rounded-lg text-xs">High End</Button>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-[2px] text-[var(--gold)] opacity-80 mb-6 font-bold">Market Hub</h3>
          <p className="text-sm text-[var(--text-dim)] leading-relaxed bg-[var(--glass)] p-4 rounded-xl border border-[var(--border)]">
              Welcome to the elite marketplace. Authenticity and luxury at your fingertips.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default Home;
