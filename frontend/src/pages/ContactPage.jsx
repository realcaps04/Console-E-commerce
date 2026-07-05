import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { contactAPI } from '../api/services';
import Spinner from '../components/ui/Spinner';
import { useState } from 'react';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await contactAPI.submit(data);
      toast.success('Message sent');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-10 lg:py-14">
      <div className="max-w-xl mb-10">
        <h1 className="page-title mb-2">Contact</h1>
        <p className="muted-text">
          Questions about an order, a product, or your account? Send us a note and we'll reply within one business day.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-6 text-sm text-muted">
          <div>
            <p className="font-medium text-ink mb-1">Email</p>
            <p>support@consoleecommerce.com</p>
          </div>
          <div>
            <p className="font-medium text-ink mb-1">Phone</p>
            <p>+91 98765 43210</p>
          </div>
          <div>
            <p className="font-medium text-ink mb-1">Address</p>
            <p>123 Premium Avenue, Tech Park<br />Bangalore 560001, India</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-1.5 block">Name</label>
              <input {...register('name', { required: 'Required', maxLength: 50 })} className="input-field" />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text mb-1.5 block">Phone</label>
              <input
                {...register('phone', {
                  required: 'Required',
                  pattern: { value: /^[+]?[\d\s-]{10,15}$/, message: 'Invalid number' },
                })}
                className="input-field"
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="label-text mb-1.5 block">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
              className="input-field"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label-text mb-1.5 block">Subject</label>
            <input {...register('subject', { required: 'Required', maxLength: 100 })} className="input-field" />
            {errors.subject && <p className="text-red-600 text-xs mt-1">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="label-text mb-1.5 block">Message</label>
            <textarea
              {...register('message', { required: 'Required', maxLength: 1000 })}
              rows={5}
              className="input-field resize-none"
            />
            {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner size="sm" /> : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
