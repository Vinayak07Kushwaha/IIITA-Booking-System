import React, { useState, useEffect } from 'react';
import PageBackground from '../components/Common/PageBackground';
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
  ButtonGroup
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { School, AccessTime, Business } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const steps = ['Select Building & Classroom', 'Choose Time Slot', 'Enter Details', 'Confirm Booking'];

const ClassroomPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({});
  const [bookingDetails, setBookingDetails] = useState({
    purpose: '',
    professor: '',
    subject: '',
    studentYear: '',
    expectedStudents: ''
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const buildings = ['CC1', 'CC2', 'CC3'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const durations = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' }
  ];

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom && selectedDate) {
      fetchBookingsForClassroom();
    }
  }, [selectedClassroom, selectedDate]);

  const fetchClassrooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/resources/classrooms');
      console.log('Classrooms response:', response.data);
      setClassrooms(response.data.classrooms || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError('Failed to load classrooms: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsForClassroom = async () => {
    try {
      const response = await api.get(
        `/booking/resource?resourceId=${selectedClassroom._id}&date=${selectedDate.toISOString().split('T')[0]}`
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
        if (!selectedBuilding) {
          toast.warning('Please select a building first');
          return false;
        }
        if (!selectedClassroom) {
          toast.warning('Please select a classroom');
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
        const { purpose, professor, subject, studentYear, expectedStudents } = bookingDetails;
        if (!purpose || !professor || !subject || !studentYear || !expectedStudents) {
          toast.warning('Please fill all required fields');
          return false;
        }
        if (parseInt(expectedStudents) > selectedClassroom?.capacity) {
          toast.warning(`Expected students (${expectedStudents}) exceeds classroom capacity (${selectedClassroom.capacity})`);
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

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setSelectedClassroom(null); // Reset classroom selection when building changes
  };

  const handleBookingSubmit = async () => {
    setSubmitting(true);
    try {
      const bookingData = {
        bookingType: 'classroom',
        resourceId: selectedClassroom._id,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        duration: selectedTimeSlot.duration,
        ...bookingDetails,
        expectedStudents: parseInt(bookingDetails.expectedStudents)
      };

      await api.post('/booking', bookingData);
      toast.success('Classroom booked successfully!');
      
      // Reset form
      setActiveStep(0);
      setSelectedBuilding('');
      setSelectedClassroom(null);
      setSelectedTimeSlot({});
      setBookingDetails({
        purpose: '',
        professor: '',
        subject: '',
        studentYear: '',
        expectedStudents: ''
      });
      setShowConfirmDialog(false);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredClassrooms = () => {
    if (!selectedBuilding) return [];
    return classrooms.filter(classroom => classroom.building === selectedBuilding);
  };

  const getBuildingStats = (building) => {
    const buildingClassrooms = classrooms.filter(c => c.building === building);
    return {
      total: buildingClassrooms.length,
      capacity: buildingClassrooms.reduce((sum, c) => sum + c.capacity, 0)
    };
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Date, Building, and Classroom
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

            {/* Building Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Step 1: Choose Building
              </Typography>
              
              <Grid container spacing={2}>
                {buildings.map((building) => {
                  const stats = getBuildingStats(building);
                  return (
                    <Grid item xs={12} sm={4} key={building}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: selectedBuilding === building ? '#e3f2fd' : '#f8f9fa',
                          border: selectedBuilding === building ? '3px solid #1976d2' : '1px solid #e0e0e0',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                            borderColor: '#1976d2'
                          },
                          position: 'relative'
                        }}
                        onClick={() => handleBuildingSelect(building)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Business sx={{ fontSize: 50, color: 'primary.main' }} />
                          </Box>
                          
                          <Typography variant="h4" gutterBottom color="primary">
                            {building}
                          </Typography>
                          
                          <Typography variant="body1" color="textSecondary" gutterBottom>
                            {stats.total} Classrooms
                          </Typography>
                          
                          <Typography variant="body2" color="textSecondary">
                            Total Capacity: {stats.capacity} students
                          </Typography>
                          
                          {selectedBuilding === building && (
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
                                justifyContent: 'center'
                              }}
                            >
                              <Typography sx={{ color: 'white', fontSize: '16px' }}>✓</Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {selectedBuilding && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Building {selectedBuilding} selected! Now choose a classroom below.
                </Alert>
              )}
            </Box>

            {/* Classroom Selection */}
            {selectedBuilding && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Step 2: Choose Classroom in {selectedBuilding} ({getFilteredClassrooms().length} available)
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {getFilteredClassrooms().map((classroom) => (
                      <Grid item xs={12} sm={6} md={4} key={classroom._id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedClassroom?._id === classroom._id 
                              ? '#e3f2fd' 
                              : '#f5f5f5',
                            border: selectedClassroom?._id === classroom._id ? '3px solid #1976d2' : '1px solid #e0e0e0',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            },
                            position: 'relative'
                          }}
                          onClick={() => setSelectedClassroom(classroom)}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{ mb: 1 }}>
                              <School sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                            
                            <Typography variant="h6" gutterBottom>
                              {classroom.roomNumber}
                            </Typography>
                            
                            <Typography variant="body2" color="textSecondary">
                              Capacity: {classroom.capacity} students
                            </Typography>
                            
                            {classroom.facilities && classroom.facilities.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {classroom.facilities.slice(0, 2).join(', ')}
                                  {classroom.facilities.length > 2 && '...'}
                                </Typography>
                              </Box>
                            )}
                            
                            {selectedClassroom?._id === classroom._id && (
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
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {selectedClassroom && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Selected: {selectedClassroom.roomNumber} in Building {selectedBuilding}
                    {bookedSlots.length > 0 && ` (${bookedSlots.length} existing booking${bookedSlots.length > 1 ? 's' : ''} today)`}
                  </Alert>
                )}
              </Box>
            )}

            {/* Quick Stats */}
            {selectedBuilding && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Building {selectedBuilding} Information:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Total Classrooms: {getBuildingStats(selectedBuilding).total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Total Capacity: {getBuildingStats(selectedBuilding).capacity} students
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Time Slot for {selectedClassroom?.roomNumber} ({selectedBuilding})
            </Typography>

            {bookedSlots.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This classroom has {bookedSlots.length} existing booking{bookedSlots.length > 1 ? 's' : ''} today. 
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
                  backgroundColor: isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) ? '#ffebee' : '#e8f5e8',
                  border: `2px solid ${isSlotConflicting(selectedTimeSlot.startTime, selectedTimeSlot.duration) ? '#f44336' : '#4caf50'}`
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Selected Time Slot
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
              Enter Booking Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Booking"
                  value={bookingDetails.purpose}
                  onChange={(e) => setBookingDetails({...bookingDetails, purpose: e.target.value})}
                  required
                  multiline
                  rows={2}
                  placeholder="e.g., Theory of Computation Lecture, Group Study Session"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Professor Name"
                  value={bookingDetails.professor}
                  onChange={(e) => setBookingDetails({...bookingDetails, professor: e.target.value})}
                  required
                  placeholder="e.g., Dr. Vinayak Singh"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={bookingDetails.subject}
                  onChange={(e) => setBookingDetails({...bookingDetails, subject: e.target.value})}
                  required
                  placeholder="e.g., Theory of Computation, Data Structures"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Student Year</InputLabel>
                  <Select
                    value={bookingDetails.studentYear}
                    label="Student Year"
                    onChange={(e) => setBookingDetails({...bookingDetails, studentYear: e.target.value})}
                  >
                    <MenuItem value="BTech 1st Year">BTech 1st Year</MenuItem>
                    <MenuItem value="BTech 2nd Year">BTech 2nd Year</MenuItem>
                    <MenuItem value="BTech 3rd Year">BTech 3rd Year</MenuItem>
                    <MenuItem value="BTech 4th Year">BTech 4th Year</MenuItem>
                    <MenuItem value="MTech 1st Year">MTech 1st Year</MenuItem>
                    <MenuItem value="MTech 2nd Year">MTech 2nd Year</MenuItem>
                    <MenuItem value="PhD">PhD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected Students"
                  type="number"
                  value={bookingDetails.expectedStudents}
                  onChange={(e) => setBookingDetails({...bookingDetails, expectedStudents: e.target.value})}
                  required
                  inputProps={{ min: 1, max: selectedClassroom?.capacity || 100 }}
                  helperText={selectedClassroom ? `Maximum capacity: ${selectedClassroom.capacity}` : ''}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Your Booking
            </Typography>
            <Paper sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Classroom Details</Typography>
                  <Typography><strong>Building:</strong> {selectedBuilding}</Typography>
                  <Typography><strong>Room:</strong> {selectedClassroom?.roomNumber}</Typography>
                  <Typography><strong>Capacity:</strong> {selectedClassroom?.capacity} students</Typography>
                  {selectedClassroom?.facilities && (
                    <Typography><strong>Facilities:</strong> {selectedClassroom.facilities.join(', ')}</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Booking Details</Typography>
                  <Typography><strong>Date:</strong> {selectedDate.toDateString()}</Typography>
                  <Typography><strong>Time:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</Typography>
                  <Typography><strong>Duration:</strong> {selectedTimeSlot.duration} hour(s)</Typography>
                  <Typography><strong>Purpose:</strong> {bookingDetails.purpose}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Academic Details</Typography>
                  <Typography><strong>Professor:</strong> {bookingDetails.professor}</Typography>
                  <Typography><strong>Subject:</strong> {bookingDetails.subject}</Typography>
                  <Typography><strong>Student Year:</strong> {bookingDetails.studentYear}</Typography>
                  <Typography><strong>Expected Students:</strong> {bookingDetails.expectedStudents}</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Please review all details carefully before confirming your booking. 
              Once confirmed, you will receive a confirmation notification.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  // Add this import at the top of the file:


// Then find the main return statement (around line 400-500) and replace it:
return (
  <PageBackground 
    backgroundImage="classroom-bg.jpg" 
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
            color: 'primary.main',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Book Classroom
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
          Reserve your academic space in CC1, CC2, or CC3 buildings
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
        <DialogTitle>Confirm Classroom Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to book <strong>{selectedClassroom?.roomNumber}</strong> in <strong>Building {selectedBuilding}</strong> on{' '}
            <strong>{selectedDate.toDateString()}</strong> from{' '}
            <strong>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  </PageBackground>
);
};

export default ClassroomPage;