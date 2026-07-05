import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiLogOut,
  FiPackage,
  FiHeart,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { useCartCount } from '../../hooks/useAuth';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = useCartCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="section-container">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-semibold tracking-tight text-ink">
            Console
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs mx-10">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-surface focus:outline-none focus:border-ink"
              />
            </div>
          </form>

          <div className="flex items-center gap-1">
            <Link
              to="/cart"
              className="relative p-2 text-ink hover:bg-surface rounded-md transition-colors"
              aria-label="Cart"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-ink text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-1.5 ml-1 hover:bg-surface rounded-md transition-colors"
                  aria-label="Account menu"
                >
                  <img
                    src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=f3f4f6&color=111`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-border rounded-md shadow-md py-1 z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface">
                        <FiUser className="w-4 h-4 text-muted" /> Account
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface">
                        <FiPackage className="w-4 h-4 text-muted" /> Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface">
                        <FiHeart className="w-4 h-4 text-muted" /> Wishlist
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface">
                          Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 text-sm w-full text-left hover:bg-surface text-red-600">
                        <FiLogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="ml-2 text-sm font-medium text-ink hover:underline hidden sm:inline">
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:bg-surface rounded-md ml-1"
              aria-label="Menu"
            >
              {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2 text-sm text-muted hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-sm font-medium">
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
