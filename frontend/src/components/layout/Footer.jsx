import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-base font-semibold text-ink">
              Console
            </Link>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-xs">
              Electronics, fashion, and home essentials — shipped across India.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">Shop</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted hover:text-ink">All products</Link></li>
              <li><Link to="/cart" className="text-muted hover:text-ink">Cart</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">Account</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/orders" className="text-muted hover:text-ink">Orders</Link></li>
              <li><Link to="/profile" className="text-muted hover:text-ink">Profile</Link></li>
              <li><Link to="/contact" className="text-muted hover:text-ink">Help</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">Contact</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>support@consoleecommerce.com</li>
              <li>+91 98765 43210</li>
              <li>Bangalore, India</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted pt-6 border-t border-border">
          © {year} Console Ecommerce. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
