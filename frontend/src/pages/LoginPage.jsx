import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
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
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrorMessage('');

    const res = await login(formData.email.trim(), formData.password);
    setSubmitting(false);

    if (res.success) {
      const destination = location.state?.from?.pathname || '/home';
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(res.message || 'Invalid Credentials');
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
            Welcome Back
          </h1>
          <p className="text-sm text-[#76685A]">
            Log in to manage your cart, orders, and wishlist
          </p>
        </div>

        {/* Invalid Credentials / Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] flex items-start space-x-3 text-[#A94442] text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              Password
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-[#76685A]">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#80664A] hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
