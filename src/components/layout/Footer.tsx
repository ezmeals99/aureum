import { Github, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black/40 backdrop-blur-md border-t border-[var(--border)] pt-16 pb-10 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-[4px] text-[var(--gold)]">AUREUM</span>
            </Link>
            <p className="text-[var(--text-dim)] text-sm max-w-xs leading-relaxed">
              The premier marketplace for luxury items and exquisite findings. 
              Built for those who appreciate the finer things.
            </p>
          </div>

          <div>
            <h4 className="text-[var(--gold)] text-xs uppercase tracking-[2px] font-bold mb-6">Marketplace</h4>
            <ul className="space-y-3 text-sm text-[var(--text-dim)]">
              <li><Link to="/" className="hover:text-white transition-colors">All Collections</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors">Sell Your Items</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Treasures</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--gold)] text-xs uppercase tracking-[2px] font-bold mb-6">Concierge</h4>
            <ul className="space-y-3 text-sm text-[var(--text-dim)]">
              <li><a href="#" className="hover:text-white transition-colors">Client Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quality Control</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Charter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Boutique</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--gold)] text-xs uppercase tracking-[2px] font-bold mb-6">Liaise</h4>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full border border-[var(--border)] bg-white/5 flex items-center justify-center text-white hover:bg-[var(--gold)] hover:text-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-[var(--border)] bg-white/5 flex items-center justify-center text-white hover:bg-[var(--gold)] hover:text-black transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-[var(--border)] bg-white/5 flex items-center justify-center text-white hover:bg-[var(--gold)] hover:text-black transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-16 pt-10 text-center text-[10px] uppercase tracking-[2px] text-[var(--text-dim)]">
          <p>© {new Date().getFullYear()} AUREUM ELITE MARKETPLACE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
