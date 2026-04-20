import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, LogOut, PlusCircle, Menu, X, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { user, profile, isAdmin, isCustomAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    localStorage.removeItem("custom_admin_auth");
    localStorage.removeItem("admin_username");
    await auth.signOut();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[70px] border-b border-[var(--border)] bg-[var(--glass)] backdrop-blur-[16px]">
      <div className="container mx-auto px-6 h-full flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-[4px] text-[var(--gold)]">AUREUM</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-[400px] relative">
          <form onSubmit={handleSearch} className="w-full relative">
            <Input
              type="text"
              placeholder="Search for luxury items, watches, tech..."
              className="w-full bg-[var(--glass)] border-[var(--border)] focus:border-[var(--gold)] transition-all rounded-full px-12 h-10 text-sm placeholder:text-[var(--text-dim)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]/60" />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Mobile Search Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[var(--gold)] hover:bg-[var(--glass)]"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {isAdmin || user ? (
            <>
              <div className="hidden lg:flex items-center gap-4">
                {user && (
                  <Link to="/sell">
                    <Button className="bg-transparent border border-[var(--gold)] text-white hover:bg-[var(--gold)] hover:text-black font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-xl transition-all active:scale-95 shadow-lg shadow-gold/10">
                      + SELL PRODUCT
                    </Button>
                  </Link>
                )}
                <Link to="/">
                  <Button variant="ghost" className="text-white hover:text-[var(--gold)] uppercase text-[10px] font-black tracking-widest">
                    GALLERY
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {user && (
                  <>
                    <Link to="/wishlist">
                      <Button variant="ghost" size="icon" className="text-white hover:text-[var(--gold)] hover:bg-white/5 relative group transition-all">
                        <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </Button>
                    </Link>

                    <Link to="/cart">
                      <Button variant="ghost" size="icon" className="text-[var(--gold)] hover:text-white hover:bg-white/5 relative group transition-all">
                        <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </Button>
                    </Link>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={`flex items-center justify-center w-10 h-10 rounded-xl glass border ${isAdmin ? "border-[var(--gold)]" : "border-white/10"} text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black transition-all active:scale-95 outline-none shadow-lg shadow-gold/10`}
                      aria-label="User menu"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 glass border-[var(--border)] text-white p-2 mt-2">
                    <div className="px-3 py-3">
                      <p className="text-[9px] uppercase tracking-[2px] font-black text-[var(--gold)] opacity-40">Identity Authenticated</p>
                      <p className="text-sm font-bold truncate text-white mt-1">{user?.email || localStorage.getItem("admin_username") || "Administrator"}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5 mx-2" />
                    {user && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-white/10 focus:bg-white/10 focus:text-[var(--gold)] cursor-pointer rounded-lg py-2.5 px-3 uppercase text-[10px] font-black tracking-widest transition-colors mb-1">
                          <User className="mr-3 h-4 w-4" /> Profile Protocol
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/my-posts")} className="hover:bg-white/10 focus:bg-white/10 focus:text-[var(--gold)] cursor-pointer rounded-lg py-2.5 px-3 uppercase text-[10px] font-black tracking-widest transition-colors mb-1">
                          <PlusCircle className="mr-3 h-4 w-4" /> Personal Gallery
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-white/5 mx-2" />
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="font-black text-[var(--gold)] hover:bg-white/10 focus:bg-white/10 focus:text-[var(--gold)] cursor-pointer rounded-lg py-2.5 px-3 uppercase text-[10px] tracking-widest transition-colors">
                          <ShieldAlert className="mr-3 h-4 w-4 text-[var(--gold)]" /> Admin Oversight
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/5 mx-2" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-lg py-2.5 px-3 uppercase text-[10px] font-black tracking-widest transition-colors">
                      <LogOut className="mr-3 h-4 w-4" /> Terminate Session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button className="bg-transparent border border-[var(--gold)] text-white hover:bg-[var(--gold)] hover:text-black font-black uppercase text-[11px] tracking-[2px] px-8 h-11 rounded-xl transition-all active:scale-95 shadow-xl shadow-gold/10">
                  LOGIN ACCESS
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center justify-center w-11 h-11 rounded-xl glass border border-white/10 text-white hover:border-[var(--gold)]/50 transition-all active:scale-95 outline-none"
                    aria-label="Access point"
                  >
                    <ShieldAlert className="w-5 h-5 text-[var(--gold)]/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass border-[var(--border)] text-white p-2 mt-2">
                  <div className="px-3 py-3">
                    <p className="text-[9px] uppercase tracking-[2px] font-black text-[var(--gold)] opacity-40">Security Access</p>
                    <p className="text-xs font-bold text-white mt-1">Marketplace Gateways</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5 mx-2" />
                  <DropdownMenuItem onClick={() => navigate("/login")} className="hover:bg-white/10 focus:bg-white/10 focus:text-[var(--gold)] cursor-pointer rounded-lg py-3 px-3 uppercase text-[10px] font-black tracking-widest transition-colors mb-1">
                    <User className="mr-3 h-4 w-4" /> User Entry
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin-login")} className="hover:bg-[var(--gold)] hover:text-black focus:bg-[var(--gold)] focus:text-black cursor-pointer rounded-lg py-3 px-3 uppercase text-[10px] font-black tracking-widest transition-colors">
                    <ShieldAlert className="mr-3 h-4 w-4" /> Admin Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden text-[var(--gold)] hover:bg-white/5">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-l border-[var(--border)] text-white">
              <div className="flex flex-col gap-10 pt-10">
                <Link to="/" className="text-3xl font-black italic tracking-[4px] text-[var(--gold)] uppercase">Aura</Link>
                <nav className="flex flex-col gap-2">
                  <Link to="/" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">Registry Home</Link>
                  {(user || isAdmin) && (
                    <>
                      {user && <Link to="/sell" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">+ Acquisition Protocol</Link>}
                      {user && <Link to="/my-posts" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">Personal Gallery</Link>}
                      {user && <Link to="/wishlist" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">Vault Records</Link>}
                      {user && <Link to="/cart" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">Pending Acquisitions</Link>}
                      {user && <Link to="/profile" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">Identity Oversight</Link>}
                      {isAdmin && <Link to="/admin" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-[var(--gold)] text-[var(--gold)]">Grandmaster Admin</Link>}
                    </>
                  )}
                  {(!user && !isAdmin) && <Link to="/login" className="text-xs font-black uppercase tracking-[2px] p-4 glass rounded-xl border border-white/5 hover:border-[var(--gold)] transition-all">Login Access</Link>}
                </nav>
                {(user || isAdmin) && (
                  <Button variant="ghost" onClick={handleLogout} className="mt-auto border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">
                    Terminate Session
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isSearchOpen && (
        <div className="md:hidden p-4 border-t border-[var(--border)] bg-black/90 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              autoFocus
              placeholder="Search global registry..."
              className="w-full bg-[var(--glass)] border-[var(--border)] focus:border-[var(--gold)] rounded-full h-12 px-12 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]/60" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
