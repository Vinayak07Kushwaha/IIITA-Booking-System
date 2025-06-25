import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import PageBackground from '../Common/PageBackground';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <PageBackground 
      backgroundImage="dashboard-bg.jpg" 
      overlay={true} 
      overlayOpacity={0.4}
    >
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 2
            }}
          >
            Welcome to IIIT Allahabad
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 300,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Book classrooms and sports facilities with ease
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <SchoolIcon sx={{ 
                    fontSize: 80, 
                    color: 'primary.main',
                    filter: 'drop-shadow(0 4px 8px rgba(25,118,210,0.3))'
                  }} />
                </Box>
                <Typography gutterBottom variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Book Classroom
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Reserve classrooms in CC1, CC2, and CC3 buildings for your academic activities.
                  Perfect for lectures, seminars, and group studies.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  size="large" 
                  variant="contained"
                  onClick={() => navigate('/classroom')}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(25,118,210,0.3)'
                  }}
                >
                  Book Classroom
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <SportsFootballIcon sx={{ 
                    fontSize: 80, 
                    color: 'secondary.main',
                    filter: 'drop-shadow(0 4px 8px rgba(220,0,78,0.3))'
                  }} />
                </Box>
                <Typography gutterBottom variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Book Playground
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Reserve sports facilities including Cricket Ground, Football Ground, 
                  Basketball Court, Volleyball Court, and Swimming Pool.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  size="large" 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('/playground')}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(220,0,78,0.3)'
                  }}
                >
                  Book Playground
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </PageBackground>
  );
};

export default Dashboard;