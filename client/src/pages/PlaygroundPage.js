import PageBackground from '../components/Common/PageBackground';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  SportsCricket, 
  SportsFootball, 
  SportsBasketball, 
  SportsVolleyball, 
  Pool,
  AccessTime,
  Add,
  Delete,
  Person,
  Phone
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const steps = ['Select Playground', 'Choose Time Slot', 'Enter Team Details', 'Confirm Booking'];

const PlaygroundPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [playgrounds, setPlaygrounds] = useState([]);
  const [selectedPlayground, setSelectedPlayground] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({});
  const [teamDetails, setTeamDetails] = useState({
    teamName: '',
    captainContact: '',
    purpose: '',
    teamMembers: [{ name: '', rollNumber: '' }]
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const durations = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' }
  ];

  useEffect(() => {
    fetchPlaygrounds();
  }, []);

  useEffect(() => {
    if (selectedPlayground && selectedDate) {
      fetchBookingsForPlayground();
    }
  }, [selectedPlayground, selectedDate]);

  const fetchPlaygrounds = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/resources/playgrounds');
      console.log('Playgrounds response:', response.data);
      setPlaygrounds(response.data.playgrounds || []);
    } catch (error) {
      console.error('Error fetching playgrounds:', error);
      setError('Failed to load playgrounds: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsForPlayground = async () => {
    try {
      const response = await api.get(
        `/booking/resource?resourceId=${selectedPlayground._id}&date=${selectedDate.toISOString().split('T')[0]}`
      );
      setBookedSlots(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookedSlots([]);
    }
  };

  const isSlotConflicting = (startTime, duration) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + duration;
    
    return bookedSlots.some(booking => {
      const bookingStart = parseInt(booking.startTime.split(':')[0]);
      const bookingEnd = parseInt(booking.endTime.split(':')[0]);
      
      return (startHour < bookingEnd && endHour > bookingStart);
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
    
    setSelectedTimeSlot(newSlot);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!selectedPlayground) {
          toast.warning('Please select a playground');
          return false;
        }
        return true;
      
      case 1:
        if (!selectedTimeSlot.startTime || !selectedTimeSlot.duration) {
          toast.warning('Please select a time slot');
          return false;
        }
        if (isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration)) {
          toast.error('This time slot conflicts with existing bookings');
          return false;
        }
        return true;
      
      case 2:
        const { teamName, captainContact, purpose } = teamDetails;
        if (!teamName || !captainContact || !purpose) {
          toast.warning('Please fill all required fields');
          return false;
        }
        const validMembers = teamDetails.teamMembers.filter(member => member.name && member.rollNumber);
        if (validMembers.length === 0) {
          toast.warning('Please add at least one team member');
          return false;
        }
        if (validMembers.length > (selectedPlayground?.maxPlayers || 20)) {
          toast.warning(`Team size (${validMembers.length}) exceeds maximum players (${selectedPlayground?.maxPlayers || 20})`);
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const addTeamMember = () => {
    setTeamDetails({
      ...teamDetails,
      teamMembers: [...teamDetails.teamMembers, { name: '', rollNumber: '' }]
    });
  };

  const removeTeamMember = (index) => {
    const newMembers = teamDetails.teamMembers.filter((_, i) => i !== index);
    setTeamDetails({
      ...teamDetails,
      teamMembers: newMembers.length > 0 ? newMembers : [{ name: '', rollNumber: '' }]
    });
  };

  const updateTeamMember = (index, field, value) => {
    const newMembers = [...teamDetails.teamMembers];
    newMembers[index][field] = value;
    setTeamDetails({
      ...teamDetails,
      teamMembers: newMembers
    });
  };

  const handleBookingSubmit = async () => {
    setSubmitting(true);
    try {
      const validMembers = teamDetails.teamMembers.filter(member => member.name && member.rollNumber);
      
      const bookingData = {
        bookingType: 'playground',
        resourceId: selectedPlayground._id,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        duration: selectedTimeSlot.duration,
        purpose: teamDetails.purpose,
        teamDetails: {
          teamName: teamDetails.teamName,
          captainContact: teamDetails.captainContact,
          teamMembers: validMembers
        }
      };

      await api.post('/booking', bookingData);
      toast.success('Playground booked successfully!');
      
      // Reset form
      setActiveStep(0);
      setSelectedPlayground(null);
      setSelectedTimeSlot({});
      setTeamDetails({
        teamName: '',
        captainContact: '',
        purpose: '',
        teamMembers: [{ name: '', rollNumber: '' }]
      });
      setShowConfirmDialog(false);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Get sport icon based on playground name
  const getSportIcon = (playgroundName) => {
    const iconProps = { sx: { fontSize: 60, color: 'primary.main' } };
    
    switch (playgroundName) {
      case 'Cricket Ground':
        return <SportsCricket {...iconProps} sx={{ ...iconProps.sx, color: '#4caf50' }} />;
      case 'Football Ground':
        return <SportsFootball {...iconProps} sx={{ ...iconProps.sx, color: '#ff9800' }} />;
      case 'Basketball Court':
        return <SportsBasketball {...iconProps} sx={{ ...iconProps.sx, color: '#f44336' }} />;
      case 'Volleyball Court':
        return <SportsVolleyball {...iconProps} sx={{ ...iconProps.sx, color: '#2196f3' }} />;
      case 'Swimming Pool':
        return <Pool {...iconProps} sx={{ ...iconProps.sx, color: '#00bcd4' }} />;
      default:
        return <SportsFootball {...iconProps} />;
    }
  };

  // Get sport color theme
  const getSportColor = (playgroundName) => {
    switch (playgroundName) {
      case 'Cricket Ground': return '#e8f5e8';
      case 'Football Ground': return '#fff8e1';
      case 'Basketball Court': return '#ffebee';
      case 'Volleyball Court': return '#e3f2fd';
      case 'Swimming Pool': return '#e0f2f1';
      default: return '#f5f5f5';
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Date and Playground
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date()}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choose Your Sport ({playgrounds.length} available)
                </Typography>
                
                {/* Single Row Layout for Playgrounds */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  overflowX: 'auto',
                  pb: 2,
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: 4,
                  }
                }}>
                  {playgrounds.map((playground) => (
                    <Card
                      key={playground._id}
                      sx={{
                        minWidth: 280,
                        maxWidth: 280,
                        cursor: 'pointer',
                        backgroundColor: selectedPlayground?._id === playground._id 
                          ? '#e3f2fd' 
                          : getSportColor(playground.name),
                        border: selectedPlayground?._id === playground._id 
                          ? '3px solid #1976d2' 
                          : '2px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                          borderColor: '#1976d2'
                        },
                        position: 'relative',
                        flexShrink: 0
                      }}
                      onClick={() => setSelectedPlayground(playground)}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          {getSportIcon(playground.name)}
                        </Box>
                        
                        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                          {playground.name}
                        </Typography>
                        
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                          Type: {playground.type}
                        </Typography>
                        
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                          Max Players: {playground.maxPlayers}
                        </Typography>
                        
                        {playground.equipment && playground.equipment.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Equipment Available:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                              {playground.equipment.slice(0, 3).map((item, index) => (
                                <Chip
                                  key={index}
                                  label={item}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                              {playground.equipment.length > 3 && (
                                <Chip
                                  label={`+${playground.equipment.length - 3} more`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        {selectedPlayground?._id === playground._id && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 2
                            }}
                          >
                            <Typography sx={{ color: 'white', fontSize: '16px' }}>✓</Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {selectedPlayground && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    🏆 Selected: {selectedPlayground.name} - Ready for booking!
                    {bookedSlots.length > 0 && ` (${bookedSlots.length} existing booking${bookedSlots.length > 1 ? 's' : ''} today)`}
                  </Alert>
                )}

                {/* Quick Info Panel */}
                {selectedPlayground && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: getSportColor(selectedPlayground.name), borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {selectedPlayground.name} Details:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">
                          <strong>Type:</strong> {selectedPlayground.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">
                          <strong>Max Players:</strong> {selectedPlayground.maxPlayers}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Equipment:</strong> {selectedPlayground.equipment?.join(', ') || 'Basic equipment available'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Time Slot for {selectedPlayground?.name}
            </Typography>

            {bookedSlots.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This playground has {bookedSlots.length} existing booking{bookedSlots.length > 1 ? 's' : ''} today. 
                Please select a time that doesn't conflict.
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={selectedTimeSlot?.startTime || ''}
                    label="Start Time"
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  >
                    {timeSlots.map(slot => (
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
              <Box sx={{ mt: 2 }}>
                <Alert 
                  severity={isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) ? 'error' : 'success'}
                >
                  {isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) 
                    ? '❌ This time slot conflicts with existing bookings' 
                    : '✅ This time slot is available'}
                </Alert>

                <Card sx={{ 
                  mt: 2,
                  backgroundColor: isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) ? '#ffebee' : getSportColor(selectedPlayground?.name),
                  border: `2px solid ${isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) ? '#f44336' : '#4caf50'}`
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getSportIcon(selectedPlayground?.name)}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Selected Time Slot for {selectedPlayground?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<AccessTime />}
                            label={`${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`}
                            color={isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) ? 'error' : 'success'}
                          />
                          <Chip 
                            label={`${selectedTimeSlot.duration} hour${selectedTimeSlot.duration > 1 ? 's' : ''}`}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {bookedSlots.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Existing Bookings for {selectedDate.toDateString()}:
                </Typography>
                {bookedSlots.map((booking, index) => (
                  <Chip
                    key={index}
                    label={`${booking.startTime} - ${booking.endTime} (${booking.purpose})`}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Team Details for {selectedPlayground?.name}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamDetails.teamName}
                  onChange={(e) => setTeamDetails({...teamDetails, teamName: e.target.value})}
                  required
                  placeholder="e.g., IIIT Warriors, Thunder Bolts"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Captain Contact"
                  value={teamDetails.captainContact}
                  onChange={(e) => setTeamDetails({...teamDetails, captainContact: e.target.value})}
                  required
                  placeholder="e.g., +91 9876543210"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'primary.main' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Booking"
                  value={teamDetails.purpose}
                  onChange={(e) => setTeamDetails({...teamDetails, purpose: e.target.value})}
                  required
                  multiline
                  rows={2}
                  placeholder="e.g., Inter-college tournament practice, Friendly match, Sports club activity"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Team Members
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Max: {selectedPlayground?.maxPlayers || 20} players
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={addTeamMember}
                    startIcon={<Add />}
                    sx={{ minWidth: 'auto' }}
                  >
                    Add Member
                  </Button>
                </Box>
              </Box>
              
              {teamDetails.teamMembers.map((member, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: getSportColor(selectedPlayground?.name) }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label={`Member ${index + 1} Name`}
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                        placeholder="e.g., Rahul Kumar"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="Roll Number"
                        value={member.rollNumber}
                        onChange={(e) => updateTeamMember(index, 'rollNumber', e.target.value)}
                        placeholder="e.g., IIT2021025"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      {teamDetails.teamMembers.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeTeamMember(index)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Alert severity="info" sx={{ mt: 2 }}>
                💡 Tip: Add all team members for proper documentation. You can add up to {selectedPlayground?.maxPlayers || 20} players for {selectedPlayground?.name}.
              </Alert>
            </Box>
          </Box>
        );

      case 3:
        const validMembers = teamDetails.teamMembers.filter(member => member.name && member.rollNumber);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Your Playground Booking
            </Typography>
            <Paper sx={{ p: 3, mt: 2, backgroundColor: getSportColor(selectedPlayground?.name) }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {getSportIcon(selectedPlayground?.name)}
                    <Box>
                      <Typography variant="subtitle2" color="primary">Playground Details</Typography>
                      <Typography variant="h6">{selectedPlayground?.name}</Typography>
                    </Box>
                  </Box>
                  <Typography><strong>Type:</strong> {selectedPlayground?.type}</Typography>
                  <Typography><strong>Max Players:</strong> {selectedPlayground?.maxPlayers}</Typography>
                  {selectedPlayground?.equipment && selectedPlayground.equipment.length > 0 && (
                    <Typography><strong>Equipment:</strong> {selectedPlayground.equipment.join(', ')}</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Booking Details</Typography>
                  <Typography><strong>Date:</strong> {selectedDate.toDateString()}</Typography>
                  <Typography><strong>Time:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</Typography>
                  <Typography><strong>Duration:</strong> {selectedTimeSlot.duration} hour(s)</Typography>
                  <Typography><strong>Purpose:</strong> {teamDetails.purpose}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Team Details</Typography>
                  <Typography><strong>Team Name:</strong> {teamDetails.teamName}</Typography>
                  <Typography><strong>Captain Contact:</strong> {teamDetails.captainContact}</Typography>
                  <Typography><strong>Total Members:</strong> {validMembers.length}</Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Team Members:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {validMembers.map((member, index) => (
                        <Chip
                          key={index}
                          label={`${member.name} (${member.rollNumber})`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              🏆 Please review all details carefully before confirming your {selectedPlayground?.name} booking. 
              Once confirmed, you will receive a confirmation notification.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  // Add this import at the top of the file:


// Then find the main return statement and replace it:
return (
  <PageBackground 
    backgroundImage="playground-bg.jpg" 
    overlay={true} 
    overlayOpacity={0.4}
  >
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: 'secondary.main',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Book Playground
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
          Reserve sports facilities for your team activities
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ 
        p: 4, 
        mb: 3, 
        minHeight: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {renderStepContent()}
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)'
      }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          size="large"
          sx={{ px: 4 }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? () => setShowConfirmDialog(true) : handleNext}
          size="large"
          disabled={submitting}
          sx={{ px: 4 }}
        >
          {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
        </Button>
      </Box>

      {/* Keep your existing confirmation dialog exactly as it is */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedPlayground && getSportIcon(selectedPlayground.name)}
            <Typography variant="h6">
              Confirm {selectedPlayground?.name} Booking
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to book <strong>{selectedPlayground?.name}</strong> on{' '}
            <strong>{selectedDate.toDateString()}</strong> from{' '}
            <strong>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</strong> for team{' '}
            <strong>{teamDetails.teamName}</strong>?
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: selectedPlayground && getSportColor(selectedPlayground.name), borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Team Members:</strong> {teamDetails.teamMembers.filter(m => m.name && m.rollNumber).length} players
            </Typography>
            <Typography variant="body2">
              <strong>Captain:</strong> {teamDetails.captainContact}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : selectedPlayground && getSportIcon(selectedPlayground.name)}
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  </PageBackground>
);
};

export default PlaygroundPage;