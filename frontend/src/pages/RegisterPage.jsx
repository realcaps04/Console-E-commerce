import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { register, clearError } from '../redux/slices/authSlice';
import Spinner from '../components/ui/Spinner';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(50),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password'),
});

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values) => {
      dispatch(clearError());
      try {
        await dispatch(register({
          name: values.name,
          email: values.email,
          password: values.password,
        })).unwrap();
        toast.success('Account created');
        navigate('/');
      } catch (err) {
        toast.error(err);
      }
    },
  });

  const fields = [
    { name: 'name', label: 'Full name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'confirmPassword', label: 'Confirm password', type: 'password' },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-ink mb-1">Create account</h1>
        <p className="text-sm text-muted mb-8">Takes about a minute.</p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {fields.map(({ name, label, type }) => (
            <div key={name}>
              <label className="label-text mb-1.5 block">{label}</label>
              <input
                type={type}
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="input-field"
              />
              {formik.touched[name] && formik.errors[name] && (
                <p className="text-red-600 text-xs mt-1">{formik.errors[name]}</p>
              )}
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size="sm" /> : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-ink font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
