import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "sonner";

// Pages
import Home from "./pages/Home";
import ItemDetails from "./pages/ItemDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import SellItem from "./pages/SellItem";
import MyPosts from "./pages/MyPosts";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-16 h-16 rounded-[2rem] glass border border-[var(--border)] animate-spin mb-4" />
      <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[4px] animate-pulse">Initializing Protocol</span>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-16 h-16 rounded-[2rem] glass border border-[var(--border)] animate-spin mb-4" />
      <span className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[4px] animate-pulse">Initializing Protocol</span>
    </div>
  );
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <div className="min-h-screen bg-black-rich text-white flex flex-col font-sans selection:bg-gold selection:text-black">
      <AuthProvider>
        <Router basename="/aureum">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/sell" element={<PrivateRoute><SellItem /></PrivateRoute>} />
              <Route path="/my-posts" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
              
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" expand={false} richColors theme="dark" />
        </Router>
      </AuthProvider>
    </div>
  );
}
