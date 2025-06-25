import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Event,
  AccessTime,
  LocationOn,
  Person,
  Cancel,
  Visibility,
  School,
  SportsFootball
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await api.get('/booking/user');
      setBookings(response.data.bookings || []);
    } catch (error) {
      toast.error('Error fetching bookings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelling(true);
    try {
      await api.put(`/booking/cancel/${bookingId}`);
      toast.success('Booking cancelled successfully');
      fetchUserBookings(); // Refresh the list
      setShowDetails(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getBookingStatus = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

    if (booking.status === 'cancelled') return { label: 'Cancelled', color: 'error' };
    if (booking.status === 'rejected') return { label: 'Rejected', color: 'error' };
    if (booking.status === 'pending') return { label: 'Pending Approval', color: 'warning' };
    
    if (bookingDay < today) return { label: 'Completed', color: 'success' };
    if (bookingDay.getTime() === today.getTime()) return { label: 'Today', color: 'info' };
    return { label: 'Upcoming', color: 'primary' };
  };

  const canCancelBooking = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const timeDiff = bookingDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 2 && booking.status !== 'cancelled' && booking.status !== 'rejected';
  };

  const filterBookings = (bookings, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 0: // All
        return bookings;
      case 1: // Upcoming
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= today && booking.status !== 'cancelled';
        });
      case 2: // Past
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate < today || booking.status === 'cancelled';
        });
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(bookings, selectedTab);

  const BookingCard = ({ booking }) => {
    const status = getBookingStatus(booking);
    
    return (
      <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {booking.bookingType === 'classroom' ? (
                  <School sx={{ mr: 1, color: 'primary.main' }} />
                ) : (
                  <SportsFootball sx={{ mr: 1, color: 'secondary.main' }} />
                )}
                <Typography variant="h6">
                  {booking.resourceId?.roomNumber || booking.resourceId?.name}
                </Typography>
                <Chip 
                  label={status.label} 
                  color={status.color} 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Event sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(booking.date).toDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {booking.startTime} - {booking.endTime} ({booking.duration}h)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {booking.resourceId?.building && `Building ${booking.resourceId.building} • `}
                  {booking.purpose}
                </Typography>
              </Box>
              
              {booking.professor && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {booking.professor} • {booking.subject}
                  </Typography>
                </Box>
              )}
              
              {booking.teamDetails?.teamName && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Team: {booking.teamDetails.teamName} ({booking.teamDetails.teamMembers?.length} members)
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetails(true);
                  }}
                >
                  View Details
                </Button>
                
                {canCancelBooking(booking) && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetails(true);
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label={`All (${bookings.length})`} />
          <Tab label={`Upcoming (${filterBookings(bookings, 1).length})`} />
          <Tab label={`Past (${filterBookings(bookings, 2).length})`} />
        </Tabs>
      </Box>

      {filteredBookings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedTab === 1 ? 'You have no upcoming bookings.' : 
             selectedTab === 2 ? 'You have no past bookings.' : 
             'You haven\'t made any bookings yet.'}
          </Typography>
        </Box>
      ) : (
        <Box>
          {filteredBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </Box>
      )}

      {/* Booking Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Booking Details - {selectedBooking?.resourceId?.roomNumber || selectedBooking?.resourceId?.name}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {selectedBooking.bookingType === 'classroom' ? 'Classroom Information' : 'Playground Information'}
                </Typography>
                <Typography><strong>Name:</strong> {selectedBooking.resourceId?.roomNumber || selectedBooking.resourceId?.name}</Typography>
                {selectedBooking.resourceId?.building && (
                  <Typography><strong>Building:</strong> {selectedBooking.resourceId.building}</Typography>
                )}
                {selectedBooking.resourceId?.capacity && (
                  <Typography><strong>Capacity:</strong> {selectedBooking.resourceId.capacity} students</Typography>
                )}
                {selectedBooking.resourceId?.maxPlayers && (
                  <Typography><strong>Max Players:</strong> {selectedBooking.resourceId.maxPlayers}</Typography>
                )}
                
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Booking Information
                </Typography>
                <Typography><strong>Date:</strong> {new Date(selectedBooking.date).toDateString()}</Typography>
                <Typography><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</Typography>
                <Typography><strong>Duration:</strong> {selectedBooking.duration} hour(s)</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={getBookingStatus(selectedBooking).label} 
                    color={getBookingStatus(selectedBooking).color} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                </Typography>
                <Typography><strong>Purpose:</strong> {selectedBooking.purpose}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {selectedBooking.bookingType === 'classroom' ? (
                  <>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Academic Details
                    </Typography>
                    <Typography><strong>Professor:</strong> {selectedBooking.professor}</Typography>
                    <Typography><strong>Subject:</strong> {selectedBooking.subject}</Typography>
                    <Typography><strong>Student Year:</strong> {selectedBooking.studentYear}</Typography>
                    <Typography><strong>Expected Students:</strong> {selectedBooking.expectedStudents}</Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Team Details
                    </Typography>
                    <Typography><strong>Team Name:</strong> {selectedBooking.teamDetails?.teamName}</Typography>
                    <Typography><strong>Captain Contact:</strong> {selectedBooking.teamDetails?.captainContact}</Typography>
                    <Typography><strong>Team Members:</strong> {selectedBooking.teamDetails?.teamMembers?.length || 0}</Typography>
                    
                    {selectedBooking.teamDetails?.teamMembers && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Members:</Typography>
                        {selectedBooking.teamDetails.teamMembers.map((member, index) => (
                          <Chip
                            key={index}
                            label={`${member.name} (${member.rollNumber})`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                )}
                
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Booking Timeline
                </Typography>
                <Typography><strong>Booked on:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</Typography>
                {selectedBooking.updatedAt !== selectedBooking.createdAt && (
                  <Typography><strong>Last updated:</strong> {new Date(selectedBooking.updatedAt).toLocaleString()}</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedBooking && canCancelBooking(selectedBooking) && (
            <Button
              color="error"
              onClick={() => handleCancelBooking(selectedBooking._id)}
              disabled={cancelling}
              startIcon={cancelling ? <CircularProgress size={16} /> : <Cancel />}
            >
              Cancel Booking
            </Button>
          )}
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingHistory;