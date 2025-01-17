import { Link as RouterLink } from "react-router-dom";
// sections
import { Stack, Typography, Link } from "@mui/material";
import AuthSocial from "../../sections/auth/AuthSocial";
import Login from "../../sections/auth/LoginForm";

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">Login to Tally</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2">Chưa có tài khoản?</Typography>

          <Link
            to={"/auth/register"}
            component={RouterLink}
            variant="subtitle2"
          >
            Đăng kí
          </Link>
        </Stack>
      </Stack>
      {/* Form */}
      <Login />

      <AuthSocial />
    </>
  );
}
