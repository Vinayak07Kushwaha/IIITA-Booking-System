import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, History, Home, School, SportsFootball } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          IIIT Allahabad - Booking System
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button 
                color="inherit" 
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{ 
                  backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                startIcon={<School />}
                onClick={() => navigate('/classroom')}
                sx={{ 
                  backgroundColor: isActive('/classroom') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Classrooms
              </Button>
              <Button 
                color="inherit" 
                startIcon={<SportsFootball />}
                onClick={() => navigate('/playground')}
                sx={{ 
                  backgroundColor: isActive('/playground') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Playgrounds
              </Button>
              <Button 
                color="inherit" 
                startIcon={<History />}
                onClick={() => navigate('/bookings')}
                sx={{ 
                  backgroundColor: isActive('/bookings') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                My Bookings
              </Button>
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                color="inherit"
                onClick={handleMenuClick}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleNavigate('/')}>
                  <Home sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/classroom')}>
                  <School sx={{ mr: 1 }} /> Classrooms
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/playground')}>
                  <SportsFootball sx={{ mr: 1 }} /> Playgrounds
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/bookings')}>
                  <History sx={{ mr: 1 }} /> My Bookings
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Welcome, {user.name}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;