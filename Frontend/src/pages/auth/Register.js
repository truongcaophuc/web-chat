import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Stack, Typography, Link } from '@mui/material';

import RegisterForm from "../../sections/auth/RegisterForm";
import AuthSocial from '../../sections/auth/AuthSocial';

// ----------------------------------------------------------------------

export default function Register() {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Get started with Tally</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2"> Đã có tài khoản? </Typography>

          <Link component={RouterLink} to={"/auth/login"} variant="subtitle2">
            Đăng nhập
          </Link>
        </Stack>
      </Stack>
      {/* Form */}
      <RegisterForm  />

      <Typography
        component="div"
        sx={{ color: 'text.secondary', mt: 3, typography: 'caption', textAlign: 'center' }}
      >
        {'By signing up, I agree to '}
        <Link underline="always" color="text.primary">
          Terms of Service
        </Link>
        {' and '}
        <Link underline="always" color="text.primary">
          Privacy Policy
        </Link>
        .
      </Typography>

     <AuthSocial />
      </>
  );
}
