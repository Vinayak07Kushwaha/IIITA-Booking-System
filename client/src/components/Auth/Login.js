import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageBackground from '../Common/PageBackground';

const Login = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(rollNumber, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <PageBackground 
      backgroundImage="login-bg.jpg" 
      overlay={true} 
      overlayOpacity={0.3}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
          }}
        >
          <Paper 
            elevation={24} 
            sx={{ 
              padding: 6, 
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                component="h1" 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                IIIT Allahabad
              </Typography>
              <Typography 
                component="h2" 
                variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 300
                }}
              >
                Booking System
              </Typography>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="rollNumber"
                label="Roll Number"
                name="rollNumber"
                autoComplete="username"
                autoFocus
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  boxShadow: '0 6px 20px rgba(25,118,210,0.3)',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In to IIIT Allahabad'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </PageBackground>
  );
};

export default Login;