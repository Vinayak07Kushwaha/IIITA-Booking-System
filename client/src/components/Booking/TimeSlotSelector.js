import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { AccessTime, Person, Event } from '@mui/icons-material';
import api from '../../services/api';

const TimeSlotSelector = ({ 
  selectedResource, 
  selectedDate, 
  onTimeSlotSelect, 
  selectedTimeSlot 
}) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  
  // Available time slots from 9 AM to 6 PM
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  const durations = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' }
  ];

  useEffect(() => {
    if (selectedResource && selectedDate) {
      fetchBookingsForResource();
    }
  }, [selectedResource, selectedDate]);

  const fetchBookingsForResource = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/booking/resource?resourceId=${selectedResource._id}&date=${selectedDate}`
      );
      setBookedSlots(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const isSlotConflicting = (startTime, duration) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + duration;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    return bookedSlots.some(booking => {
      const bookingStart = parseInt(booking.startTime.split(':')[0]);
      const bookingEnd = parseInt(booking.endTime.split(':')[0]);
      
      // Check for overlap
      return (startHour < bookingEnd && endHour > bookingStart);
    });
  };

  const getAvailableSlots = () => {
    return timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      const maxDuration = selectedTimeSlot?.duration || 2;
      // Don't show slots that would end after 6 PM
      return hour + maxDuration <= 18;
    });
  };

  const handleTimeChange = (field, value) => {
    const newSlot = { ...selectedTimeSlot, [field]: value };
    
    if (field === 'startTime' || field === 'duration') {
      const startHour = parseInt(newSlot.startTime?.split(':')[0] || 0);
      const duration = newSlot.duration || 1;
      const endHour = startHour + duration;
      newSlot.endTime = `${endHour.toString().padStart(2, '0')}:00`;
    }
    
    onTimeSlotSelect(newSlot);
  };

  const getSlotStatus = () => {
    if (!selectedTimeSlot?.startTime || !selectedTimeSlot?.duration) {
      return { available: null, message: 'Please select start time and duration' };
    }

    const isConflicting = isSlotConflicting(
      selectedTimeSlot.startTime, 
      selectedTimeSlot.duration
    );

    return {
      available: !isConflicting,
      message: isConflicting 
        ? 'This time slot conflicts with existing bookings' 
        : 'This time slot is available'
    };
  };

  const slotStatus = getSlotStatus();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Select Time Slot
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => setShowBookings(true)}
          startIcon={<Event />}
        >
          View Existing Bookings ({bookedSlots.length})
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Start Time</InputLabel>
            <Select
              value={selectedTimeSlot?.startTime || ''}
              label="Start Time"
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
            >
              {getAvailableSlots().map(slot => (
                <MenuItem key={slot} value={slot}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" />
                    {slot}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Duration</InputLabel>
            <Select
              value={selectedTimeSlot?.duration || ''}
              label="Duration"
              onChange={(e) => handleTimeChange('duration', e.target.value)}
              disabled={!selectedTimeSlot?.startTime}
            >
              {durations.map(duration => {
                const startHour = parseInt(selectedTimeSlot?.startTime?.split(':')[0] || 0);
                const wouldEndAfter6PM = startHour + duration.value > 18;
                
                return (
                  <MenuItem 
                    key={duration.value} 
                    value={duration.value}
                    disabled={wouldEndAfter6PM}
                  >
                    {duration.label}
                    {wouldEndAfter6PM && ' (Would exceed 6 PM)'}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth disabled>
            <InputLabel>End Time</InputLabel>
            <Select
              value={selectedTimeSlot?.endTime || ''}
              label="End Time"
            >
              {selectedTimeSlot?.endTime && (
                <MenuItem value={selectedTimeSlot.endTime}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" />
                    {selectedTimeSlot.endTime}
                  </Box>
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {selectedTimeSlot?.startTime && selectedTimeSlot?.duration && (
        <Box sx={{ mt: 3 }}>
          <Alert 
            severity={slotStatus.available ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {slotStatus.message}
          </Alert>
          
          <Card sx={{ 
            backgroundColor: slotStatus.available ? '#e8f5e8' : '#f8d7da',
            border: `2px solid ${slotStatus.available ? '#4caf50' : '#f44336'}`
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Time Slot
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<AccessTime />}
                  label={`${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`}
                  color={slotStatus.available ? 'success' : 'error'}
                />
                <Chip 
                  label={`${selectedTimeSlot.duration} hour${selectedTimeSlot.duration > 1 ? 's' : ''}`}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Existing Bookings Dialog */}
      <Dialog 
        open={showBookings} 
        onClose={() => setShowBookings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Existing Bookings for {selectedResource?.roomNumber || selectedResource?.name}
        </DialogTitle>
        <DialogContent>
          {bookedSlots.length === 0 ? (
            <Typography>No bookings for this date.</Typography>
          ) : (
            <List>
              {bookedSlots.map((booking, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${booking.startTime} - ${booking.endTime}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Purpose: {booking.purpose}
                        </Typography>
                        {booking.professor && (
                          <Typography variant="body2">
                            Professor: {booking.professor}
                          </Typography>
                        )}
                        {booking.teamDetails?.teamName && (
                          <Typography variant="body2">
                            Team: {booking.teamDetails.teamName}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeSlotSelector;
