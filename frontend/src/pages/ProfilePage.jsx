import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, fetchMe } from '../redux/slices/authSlice';
import { authAPI } from '../api/services';
import Spinner from '../components/ui/Spinner';
import { FiUser, FiHeart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().max(50),
      phone: Yup.string().matches(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone'),
    }),
    onSubmit: async (values) => {
      try {
        await dispatch(updateProfile(values)).unwrap();
        toast.success('Profile updated!');
      } catch (err) {
        toast.error(err);
      }
    },
  });

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;
    try {
      await authAPI.deleteAccount();
      toast.success('Account deleted');
      window.location.href = '/';
    } catch {
      toast.error('Failed to delete account');
    }
  };

  if (!user) {
    return (
      <div className="section-container py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="section-container py-8 lg:py-12">
      <h1 className="text-3xl font-display font-bold mb-8">My Account</h1>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-card p-4 space-y-1">
            {[
              { id: 'profile', label: 'Profile', icon: FiUser },
              { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-primary-500/10 text-primary-500 text-xs font-medium rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input name="name" value={formik.values.name} onChange={formik.handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input name="phone" value={formik.values.phone} onChange={formik.handleChange} className="input-field" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Spinner size="sm" /> : 'Save Changes'}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm"
                >
                  <FiTrash2 /> Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
              {user.wishlist?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.wishlist.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-primary-500 font-semibold">₹{product.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Your wishlist is empty</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
