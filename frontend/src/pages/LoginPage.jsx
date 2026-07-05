import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { login, clearError } from '../redux/slices/authSlice';
import Spinner from '../components/ui/Spinner';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: { email: '', password: '', rememberMe: false },
    validationSchema,
    onSubmit: async (values) => {
      dispatch(clearError());
      try {
        await dispatch(login({ email: values.email, password: values.password })).unwrap();
        toast.success('Signed in');
        navigate(from);
      } catch (err) {
        toast.error(err);
      }
    },
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-ink mb-1">Sign in</h1>
        <p className="text-sm text-muted mb-8">Use your Console account to continue.</p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="label-text mb-1.5 block">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="label-text mb-1.5 block">Password</label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-muted">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                className="rounded border-border"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-ink hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size="sm" /> : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          No account?{' '}
          <Link to="/register" className="text-ink font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
