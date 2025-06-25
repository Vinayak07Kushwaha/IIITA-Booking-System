
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  School,
  SportsFootball,
  SportsBasketball,
  Pool,
  SportsVolleyball,
  SportsCricket
} from '@mui/icons-material';
import api from '../../services/api';

const BookingGrid = ({ 
  resources, 
  selectedResource, 
  onResourceSelect, 
  selectedDate,
  bookingType 
}) => {
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && resources.length > 0) {
      fetchBookingsForDate();
    }
  }, [selectedDate, resources]);

  const fetchBookingsForDate = async () => {
    setLoading(true);
    try {
      const bookingPromises = resources.map(resource =>
        api.get(`/booking/resource?resourceId=${resource._id}&date=${selectedDate}`)
      );
      
      const responses = await Promise.all(bookingPromises);
      const bookingData = {};
      
      responses.forEach((response, index) => {
        bookingData[resources[index]._id] = response.data.bookings || [];
      });
      
      setBookings(bookingData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceBookingCount = (resourceId) => {
    const resourceBookings = bookings[resourceId] || [];
    return resourceBookings.length;
  };

  const getResourceColor = (resourceId) => {
    const bookingCount = getResourceBookingCount(resourceId);
    if (bookingCount === 0) return '#e8f5e8'; // Light green
    if (bookingCount < 3) return '#fff3cd'; // Light yellow
    return '#f8d7da'; // Light red
  };

  const getStatusChip = (resourceId) => {
    const bookingCount = getResourceBookingCount(resourceId);
    if (bookingCount === 0) {
      return <Chip label="Available" color="success" size="small" />;
    } else if (bookingCount < 3) {
      return <Chip label={`${bookingCount} bookings`} color="warning" size="small" />;
    } else {
      return <Chip label="Busy" color="error" size="small" />;
    }
  };

  const getResourceIcon = (resource) => {
    if (bookingType === 'classroom') {
      return <School sx={{ fontSize: 40, color: 'primary.main' }} />;
    }
    
    // Playground icons
    switch (resource.name) {
      case 'Cricket Ground':
        return <SportsCricket sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'Football Ground':
        return <SportsFootball sx={{ fontSize: 40, color: 'warning.main' }} />;
      case 'Basketball Court':
        return <SportsBasketball sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'Volleyball Court':
        return <SportsVolleyball sx={{ fontSize: 40, color: 'info.main' }} />;
      case 'Swimming Pool':
        return <Pool sx={{ fontSize: 40, color: 'primary.main' }} />;
      default:
        return <SportsFootball sx={{ fontSize: 40, color: 'secondary.main' }} />;
    }
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(8)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {bookingType === 'classroom' ? 'Select Classroom' : 'Select Playground'}
      </Typography>
      
      <Grid container spacing={2}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={bookingType === 'classroom' ? 3 : 4} key={resource._id}>
            <Card
              sx={{
                cursor: 'pointer',
                backgroundColor: getResourceColor(resource._id),
                border: selectedResource?._id === resource._id 
                  ? '3px solid #1976d2' 
                  : '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: '#1976d2'
                },
                position: 'relative',
                minHeight: 180
              }}
              onClick={() => onResourceSelect(resource)}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  {getResourceIcon(resource)}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {resource.roomNumber || resource.name}
                </Typography>
                
                {resource.building && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Building: {resource.building}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  {getStatusChip(resource._id)}
                </Box>
                
                {resource.capacity && (
                  <Typography variant="caption" display="block">
                    Capacity: {resource.capacity}
                  </Typography>
                )}
                
                {resource.maxPlayers && (
                  <Typography variant="caption" display="block">
                    Max Players: {resource.maxPlayers}
                  </Typography>
                )}
                
                {resource.facilities && resource.facilities.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {resource.facilities.slice(0, 2).map((facility, index) => (
                      <Chip
                        key={index}
                        label={facility}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                      />
                    ))}
                    {resource.facilities.length > 2 && (
                      <Typography variant="caption" color="textSecondary">
                        +{resource.facilities.length - 2} more
                      </Typography>
                    )}
                  </Box>
                )}
                
                {resource.equipment && resource.equipment.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Equipment: {resource.equipment.slice(0, 2).join(', ')}
                      {resource.equipment.length > 2 && '...'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              {selectedResource?._id === resource._id && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: '12px' }}>✓</Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookingGrid;