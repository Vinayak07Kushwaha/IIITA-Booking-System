import React from 'react';
import { Box } from '@mui/material';

const PageBackground = ({ 
  children, 
  backgroundImage, 
  overlay = true, 
  overlayOpacity = 0.7,
  minHeight = '100vh' 
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: minHeight,
        backgroundImage: `url(/images/backgrounds/${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        '&::before': overlay ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`,
          zIndex: 1
        } : {}
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageBackground;