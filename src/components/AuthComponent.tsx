import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthComponent: React.FC = () => {
  const [tab, setTab] = useState(0); // 0: Login, 1: Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (!email || !password || (tab === 1 && !fullName)) return;

    const endpoint = tab === 0 ? '/api/login' : '/api/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          tab === 0 ? { email, password } : { fullName, email, password }
        ),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Something went wrong');
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      login();

      navigate(tab === 0 ? '/chat' : '/onboard');
    } catch (error: any) {
      alert(error.message || 'Auth failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.77)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.49)',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            PersonaPost
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          <Box component="form" noValidate autoComplete="off">
            {tab === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                variant="outlined"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, py: 1.5 }}
              onClick={handleAuth}
            >
              {tab === 0 ? 'Login' : 'Sign Up'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthComponent;
