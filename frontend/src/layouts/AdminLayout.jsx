import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiUsers, FiBarChart2, FiSettings, FiShoppingBag } from 'react-icons/fi';
import { classNames } from '../utils/helpers';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: FiGrid, exact: true },
  { to: '/admin/products', label: 'Products', icon: FiShoppingBag },
  { to: '/admin/orders', label: 'Orders', icon: FiPackage },
  { to: '/admin/users', label: 'Customers', icon: FiUsers },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-56 bg-white border-r border-border fixed h-full">
        <div className="px-5 py-5 border-b border-border">
          <Link to="/" className="text-sm font-semibold text-ink">
            Console
          </Link>
          <p className="text-xs text-muted mt-0.5">Admin</p>
        </div>

        <nav className="p-3 space-y-0.5">
          {adminLinks.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={classNames(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-ink text-white'
                    : 'text-muted hover:text-ink hover:bg-surface'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 ml-56">
        <main className="p-8 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
