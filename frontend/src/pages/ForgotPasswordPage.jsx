import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/services';
import Spinner from '../components/ui/Spinner';
import { useState } from 'react';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authAPI.forgotPassword(values.email);
        setSent(true);
        toast.success('Reset email sent if account exists');
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
  });

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Check Your Email</h1>
          <p className="text-gray-500 mb-6">
            If an account exists for {formik.values.email}, we've sent password reset instructions.
          </p>
          <Link to="/login" className="btn-primary">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-display font-bold text-center mb-8">Forgot Password</h1>
        <form onSubmit={formik.handleSubmit} className="glass-card p-8 space-y-5">
          <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link.</p>
          <div>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className="input-field"
              placeholder="Email address"
            />
            {formik.errors.email && formik.touched.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
          </button>
          <Link to="/login" className="block text-center text-sm text-primary-500 hover:underline">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
