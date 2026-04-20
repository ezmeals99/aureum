import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, deleteDoc, addDoc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Item, Category, UserProfile } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users, Tag, ShoppingBag, ShieldAlert, Pin, PinOff } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCatName, setNewCatName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      const userSnap = await getDocs(collection(db, "users"));
      setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));

      const itemSnap = await getDocs(query(collection(db, "items"), orderBy("createdAt", "desc")));
      setItems(itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const togglePin = async (item: Item) => {
    try {
      const newPinned = !item.isPinned;
      await updateDoc(doc(db, "items", item.id), { isPinned: newPinned });
      toast.success(newPinned ? "Listing Pinned" : "Listing Unpinned");
      fetchData();
    } catch (error) {
      toast.error("Failed to update pin status");
    }
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const docRef = await addDoc(collection(db, "categories"), { name: newCatName, createdAt: new Date() });
      await updateDoc(doc(db, "categories", docRef.id), { id: docRef.id });
      setNewCatName("");
      fetchData();
      toast.success("Category added");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      fetchData();
      toast.success("Category removed");
    } catch (error) {
      toast.error("Failed to remove category");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
      fetchData();
      toast.success("Listing removed");
    } catch (error) {
      toast.error("Failed to remove listing");
    }
  };

  if (!isAdmin) return <div className="h-screen flex items-center justify-center text-red-500">UNAUTHORIZED ACCESS</div>;

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <div className="flex items-center gap-6 mb-16 border-b border-white/5 pb-10">
        <div className="w-20 h-20 rounded-[2.5rem] glass flex items-center justify-center border border-[var(--border)] shadow-xl shadow-black/40">
           <ShieldAlert className="w-10 h-10 text-[var(--gold)]" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight italic">Protocol Oversight</h1>
          <p className="text-[var(--text-dim)] text-xs uppercase tracking-[2px] font-bold mt-2 opacity-60">Systemic marketplace governance and strategic control</p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-10">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-xl">
          <TabsTrigger value="items" className="data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-widest flex gap-3 transition-all">
            <ShoppingBag className="w-4 h-4" /> Listings
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-widest flex gap-3 transition-all">
            <Tag className="w-4 h-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-widest flex gap-3 transition-all">
            <Users className="w-4 h-4" /> Participants
          </TabsTrigger>
        </TabsList>

        {/* --- Listings --- */}
        <TabsContent value="items">
          <Card className="glass border-[var(--border)] text-white shadow-2xl p-2">
            <CardHeader className="p-8">
              <CardTitle className="text-white uppercase tracking-tight text-xl font-black">Active Market Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="border-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest px-8">Designation</TableHead>
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest">Origin</TableHead>
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest">Valuation</TableHead>
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest text-right px-8">Protocols</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <TableCell className="font-bold text-white px-8 uppercase text-xs tracking-tight transition-colors group-hover:text-[var(--gold)] flex items-center gap-2">
                        {item.isPinned && <Pin className="w-3 h-3 text-[var(--gold)] fill-[var(--gold)]" />}
                        {item.name}
                      </TableCell>
                      <TableCell className="text-[var(--text-dim)] font-mono text-[10px] uppercase">{item.sellerId.substring(0, 12)}</TableCell>
                      <TableCell className="text-[var(--gold)] font-black text-lg">${item.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right px-8 space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => togglePin(item)}
                          className={`${item.isPinned ? "text-[var(--gold)]" : "text-white/20"} hover:bg-white/10 rounded-lg`}
                          title={item.isPinned ? "Unpin Post" : "Pin Post"}
                        >
                          {item.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Categories --- */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="glass border-[var(--border)] text-white lg:col-span-1 h-fit p-2">
              <CardHeader className="p-6">
                <CardTitle className="text-white uppercase tracking-tight text-sm font-black">Initialize Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-black text-[var(--gold)]/40 tracking-widest">Entry Name</Label>
                   <Input 
                    placeholder="e.g. Rare Horology" 
                    className="bg-[var(--glass)] border-[var(--border)] h-12 rounded-xl focus:border-[var(--gold)]"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                   />
                </div>
                <Button onClick={addCategory} className="w-full bg-transparent border border-[var(--gold)] text-white hover:bg-[var(--gold)] hover:text-black h-12 rounded-xl font-black uppercase text-[11px] tracking-[2px] transition-all active:scale-95 shadow-xl shadow-gold/20">
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </CardContent>
            </Card>

            <Card className="glass border-[var(--border)] text-white lg:col-span-2 p-2">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="border-white/5">
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest px-8 py-6">Registered Categories</TableHead>
                      <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest text-right px-8 py-6">Protocols</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                        <TableCell className="text-white font-bold p-8 uppercase text-xs tracking-tight transition-colors group-hover:text-[var(--gold)]">{cat.name}</TableCell>
                        <TableCell className="text-right px-8 py-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteCategory(cat.id)}
                            className="text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Users --- */}
        <TabsContent value="users">
          <Card className="glass border-[var(--border)] text-white shadow-2xl p-2">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="border-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest px-8 py-6">Identity</TableHead>
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest py-6">Coordinates</TableHead>
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest py-6">Clearance</TableHead>
                    <TableHead className="text-[var(--gold)]/40 uppercase text-[10px] font-black tracking-widest text-right px-8 py-6">Intervention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <TableCell className="text-white font-bold px-8 py-6 uppercase text-xs tracking-tight transition-colors group-hover:text-[var(--gold)]">{u.displayName || "Unidentified Participant"}</TableCell>
                      <TableCell className="text-[var(--text-dim)] py-6 text-xs">{u.email}</TableCell>
                      <TableCell className="py-6">
                        <Badge className={`${u.role === 'admin' ? "bg-[var(--gold)] text-black" : "bg-white/5 text-white border border-white/10"} font-black uppercase text-[9px] px-3 py-1 rounded-full`}>
                          {u.role || "MEMBER"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8 py-6 font-bold">
                        {u.id !== user?.uid && (
                          <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 rounded-xl uppercase text-[10px] font-black tracking-widest px-4 h-9">
                            Restrict Access
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
