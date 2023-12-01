// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'

import { notification } from "antd";


// ** MUI Components




import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import * as Yup from "yup";
import { useRouter } from "next/router";
import { auth, db, updateUserRole } from "../../../Firebase/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  FirebaseAuthException,
} from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";

import Icon from 'src/@core/components/icon'

// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Styled Components
const RegisterIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const RegisterIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '38rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '30rem'
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const Register = () => {

  const router = useRouter();

  // ** States
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Validation function
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    } else {
      newErrors.username = '';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address';
      valid = false;
    } else {
      newErrors.email = '';
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      valid = false;
    } else {
      newErrors.password = '';
    }

    setFormErrors(newErrors);

    return valid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("values", formData)

    // Validate the form
    if (!validateForm()) {

      return;
    }


    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential?.user;
      console.log("userID", user?.uid);
      const collectionRef = collection(db, "Users");


      const docRef = doc(collectionRef, user?.uid);

      await setDoc(docRef, { UserName: formData.username, Email: formData.email, Role: "User" }, { merge: true });

      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      notification.open({
        type: "success",
        message: "Successfully Registered!",
        placement: "top",
      });

      router.push('/dashboard')
    } catch (error) {
      const message = error.message;

      console.error('Error signing in:', error.message);

      if (error.message === "Firebase: Error (auth/email-already-in-use).") {
        notification.open({
          type: "error",
          message: "Email already in use!",
          placement: "top",
        });
        setFormErrors("");
      } else {
        var modifiedText = message.replace("Firebase:", "");
        setFormErrors("");

        notification.open({
          type: "error",
          message: modifiedText,
          placement: "top",
        });
      }
    }


  };

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings
  const imageSource = skin === 'bordered' ? 'auth-v2-register-illustration-bordered' : 'auth-v2-register-illustration'

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <RegisterIllustrationWrapper>
            <RegisterIllustration
              alt='register-illustration'
              src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
            />
          </RegisterIllustrationWrapper>
          <FooterIllustrationsV2 image={`/images/pages/auth-v2-register-mask-${theme.palette.mode}.png`} />
        </Box>
      ) : null}
      <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <Box
          sx={{
            p: 7,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <BoxWrapper>
            <Box
              sx={{
                top: 30,
                left: 40,
                display: 'flex',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width={47} fill='none' height={26} viewBox='0 0 268 150' xmlns='http://www.w3.org/2000/svg'>
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 195.571 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fillOpacity='0.4'
                  fill='url(#paint0_linear_7821_79167)'
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 196.084 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(0.865206 0.501417 -0.498585 0.866841 173.147 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 94.1973 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fillOpacity='0.4'
                  fill='url(#paint1_linear_7821_79167)'
                  transform='matrix(-0.865206 0.501417 0.498585 0.866841 94.1973 0)'
                />
                <rect
                  rx='25.1443'
                  width='50.2886'
                  height='143.953'
                  fill={theme.palette.primary.main}
                  transform='matrix(0.865206 0.501417 -0.498585 0.866841 71.7728 0)'
                />
                <defs>
                  <linearGradient
                    y1='0'
                    x1='25.1443'
                    x2='25.1443'
                    y2='143.953'
                    id='paint0_linear_7821_79167'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop />
                    <stop offset='1' stopOpacity='0' />
                  </linearGradient>
                  <linearGradient
                    y1='0'
                    x1='25.1443'
                    x2='25.1443'
                    y2='143.953'
                    id='paint1_linear_7821_79167'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop />
                    <stop offset='1' stopOpacity='0' />
                  </linearGradient>
                </defs>
              </svg>
              <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
                {themeConfig.templateName}
              </Typography>
            </Box>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled variant='h5'>Adventure starts here 🚀</TypographyStyled>
              <Typography variant='body2'>Make your app management easy and fun!</Typography>
            </Box>
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              {/* Other form fields */}
              <TextField
                autoFocus
                fullWidth
                sx={{ mb: 4 }}
                label="Username"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={!!formErrors.username}
                helperText={formErrors.username}

              />
              <TextField
                fullWidth
                label="Email"
                sx={{ mb: 4 }}
                placeholder="user@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <FormControl fullWidth>
                {/* Password field */}
                {/* Add error and helperText properties similar to other fields */}
                {/* <InputLabel htmlFor="auth-login-v2-password">Password</InputLabel> */}
                <TextField

                  id="auth-login-v2-password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  value={formData.password}
                  label="Password"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Icon icon="mdi:eye-outline" /> : <Icon icon="mdi:eye-off-outline" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}


                  labelWidth={80}
                />
              </FormControl>
              {/* Other form fields */}
              <Button fullWidth size="large" type="submit" variant="contained" sx={{ mb: 7, mt: 8 }}>
                Sign up
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ mr: 2, color: 'text.secondary' }}>Already have an account?</Typography>
                <Typography href='/login' component={Link} sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Sign in instead
                </Typography>
              </Box>
            </form>
          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  )
}
Register.getLayout = page => <BlankLayout>{page}</BlankLayout>
Register.guestGuard = true

export default Register
