// components/AuthComponent.tsx
import React, { useState } from 'react';
import axios from 'axios';
import type { AlertColor } from '@mui/material';
import {
  Container,
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

type AlertState = {
  message: string;
  severity: AlertColor;
};

interface AuthComponentProps {
  onAuthSuccess: () => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState(0); // 0: Login, 1: Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const navigate = useNavigate();
  const handleCloseAlert = () => setAlert(null);

  const handleAuth = async () => {
    if (!email || !password || (tab === 1 && !full_name)) {
      setAlert({ message: 'Please fill in all required fields.', severity: 'warning' });
      return;
    }

    const baseUrl = 'http://localhost:3010/api/onboard';
    const endpoint = tab === 0 ? `${baseUrl}/login` : `${baseUrl}/signup`;
    const payload = tab === 0
      ? { email, password }
      : { email, password, full_name };

    try {
      setLoading(true);
      const { data } = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      if (data?.error) {
        setAlert({ message: data.error, severity: 'error' });
        return;
      }

      // Store authentication data
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      localStorage.setItem('isAuthenticated', 'true');

      // For login: user is already onboarded
      // For signup: user needs to complete onboarding
      if (tab === 0) {
        // Login - assume user is already onboarded
        localStorage.setItem('isOnboarded', 'true');
        localStorage.setItem('full_name', data.full_name || 'User');
      } else {
        // Signup - user needs onboarding
        localStorage.setItem('isOnboarded', 'false');
      }

      // Store user info if available
      if (data?.full_name) {
        localStorage.setItem('full_name', data.full_name);
      }

      setAlert({
        message: tab === 0 ? 'Login successful!' : 'Registration successful!',
        severity: 'success',
      });

      // Update parent component state
      onAuthSuccess();

      // Navigate after a short delay
      setTimeout(() => {
        if (tab === 0) {
          navigate('/chat');
        } else {
          navigate('/onboard');
        }
      }, 1000);

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      setAlert({ message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const alertContent = alert ? (
    <Alert
      onClose={handleCloseAlert}
      severity={alert.severity}
      variant="filled"
      sx={{ width: '100%' }}
    >
      {alert.message}
    </Alert>
  ) : undefined;

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
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              variant="outlined"
              type="email"
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
              disabled={loading}
            >
              {loading ? 'Processing...' : tab === 0 ? 'Login' : 'Sign Up'}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={Boolean(alert)}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alertContent}
      </Snackbar>
    </Box>
  );
};

export default AuthComponent;