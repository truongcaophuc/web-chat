// @mui
import { Divider, IconButton, Stack } from '@mui/material';
import { GithubLogo, GoogleLogo, TwitterLogo } from 'phosphor-react';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebaseConfig";
import { useDispatch } from 'react-redux';
import { LoginUserByGoogle } from '../../redux/slices/auth';

// ----------------------------------------------------------------------

export default function AuthSocial() {
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User Info:", user);

      // Lưu thông tin người dùng (tuỳ chọn)
      dispatch(LoginUserByGoogle(user));
    } catch (error) {
      console.error("Error during Google Login:", error);
    }
  };

  const handleGithubLogin = async () => {
    
  };

  const handleTwitterLogin = async () => {
    
  };

  return (
    <div>
      <Divider
        sx={{
          my: 2.5,
          typography: 'overline',
          color: 'text.disabled',
          '&::before, ::after': {
            borderTopStyle: 'dashed',
          },
        }}
      >
        Hoặc
      </Divider>

      <Stack direction="row" justifyContent="center" spacing={2}>
        <IconButton onClick={handleGoogleLogin}>
          <GoogleLogo color="#DF3E30" />
        </IconButton>

        <IconButton color="inherit" onClick={handleGithubLogin}>
          <GithubLogo />
        </IconButton>

        <IconButton onClick={handleTwitterLogin}>
          <TwitterLogo color="#1C9CEA" />
        </IconButton>
      </Stack>
    </div>
  );
}
