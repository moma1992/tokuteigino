import React from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';

export const authRoutes = (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/signup" element={<SignupForm />} />
    <Route path="/reset-password" element={<PasswordResetForm />} />
  </Route>
);