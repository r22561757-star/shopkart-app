import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must contain at least 6 characters';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');
    setSuccessMsg('');

    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: formData.email } });
      }, 1500);
    } else {
      setServerError(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#FFFDF8] rounded-3xl border border-[#E5D9C8] p-8 sm:p-10 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#80664A]">
            Lab 01 & 02 • Authentication
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#342A22] mt-1 mb-2">
            Create an Account
          </h1>
          <p className="text-sm text-[#76685A]">
            Join ShopKart for mindful, intentional shopping
          </p>
        </div>

        {/* Server Alert Messages */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] flex items-start space-x-3 text-[#A94442] text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#E8F4EC] border border-[#C3E4CD] flex items-start space-x-3 text-[#3D7A5A] text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#342A22] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#76685A]" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4EC]/60 border rounded-xl text-sm text-[#342A22] focus:bg-[#FFFDF8] focus:outline-none transition ${
                  errors.fullName
                    ? 'border-[#A94442] focus:border-[#A94442]'
                    : 'border-[#E5D9C8] focus:border-[#80664A]'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-[#A94442]">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#342A22] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#76685A]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4EC]/60 border rounded-xl text-sm text-[#342A22] focus:bg-[#FFFDF8] focus:outline-none transition ${
                  errors.email
                    ? 'border-[#A94442] focus:border-[#A94442]'
                    : 'border-[#E5D9C8] focus:border-[#80664A]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-[#A94442]">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#342A22] mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#76685A]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4EC]/60 border rounded-xl text-sm text-[#342A22] focus:bg-[#FFFDF8] focus:outline-none transition ${
                  errors.password
                    ? 'border-[#A94442] focus:border-[#A94442]'
                    : 'border-[#E5D9C8] focus:border-[#80664A]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-[#A94442]">{errors.password}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#342A22] mb-1.5">
              Phone Number (10 digits)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#76685A]" />
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#F8F4EC]/60 border rounded-xl text-sm text-[#342A22] focus:bg-[#FFFDF8] focus:outline-none transition ${
                  errors.phone
                    ? 'border-[#A94442] focus:border-[#A94442]'
                    : 'border-[#E5D9C8] focus:border-[#80664A]'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-[#A94442]">{errors.phone}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full mt-2 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-sm font-semibold text-[#FFFDF8] transition shadow-sm ${
              submitting
                ? 'bg-[#80664A]/70 cursor-not-allowed'
                : 'bg-[#80664A] hover:bg-[#695239] active:scale-[0.99]'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-[#76685A]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#80664A] hover:underline"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
