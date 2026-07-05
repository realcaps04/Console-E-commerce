import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { authAPI } from '../api/services';
import Spinner from '../components/ui/Spinner';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      password: Yup.string().min(6).required('Password is required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authAPI.resetPassword(token, values.password);
        toast.success('Password reset successful!');
        navigate('/login');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Reset failed');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-display font-bold text-center mb-8">Reset Password</h1>
        <form onSubmit={formik.handleSubmit} className="glass-card p-8 space-y-5">
          {['password', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field === 'confirmPassword' ? 'Confirm Password' : 'New Password'}
              </label>
              <input
                type="password"
                name={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
                className="input-field"
              />
              {formik.touched[field] && formik.errors[field] && (
                <p className="text-red-500 text-sm mt-1">{formik.errors[field]}</p>
              )}
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size="sm" /> : 'Reset Password'}
          </button>
          <Link to="/login" className="block text-center text-sm text-primary-500 hover:underline">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
