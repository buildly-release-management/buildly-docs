.. _responsive-design:

Responsive Design Guidelines
=============================

Comprehensive guidelines for building responsive, mobile-first applications with Buildly.

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Responsive design ensures your application works seamlessly across all devices and screen sizes. This guide covers Buildly's responsive design patterns, breakpoints, and best practices.

Design Philosophy
-----------------

**Mobile-First Approach**

Start with mobile design and progressively enhance for larger screens:

- Design for smallest screens first
- Add complexity as screen size increases
- Ensure core functionality works on all devices
- Progressive enhancement over graceful degradation

**Fluid Layouts**

- Use percentage-based widths
- Flexible grids and containers
- Scalable images and media
- Relative units (rem, em, %, vw, vh)

Breakpoint System
-----------------

Standard Breakpoints
~~~~~~~~~~~~~~~~~~~~

Buildly uses a consistent breakpoint system across frameworks:

.. code-block:: javascript

   const breakpoints = {
     xs: '0px',      // Extra small: phones (portrait)
     sm: '600px',    // Small: phones (landscape)
     md: '960px',    // Medium: tablets
     lg: '1280px',   // Large: desktops
     xl: '1920px',   // Extra large: large desktops
   };

**Usage in CSS:**

.. code-block:: css

   /* Mobile first - base styles */
   .container {
     padding: 16px;
     font-size: 14px;
   }
   
   /* Tablet and up */
   @media (min-width: 960px) {
     .container {
       padding: 24px;
       font-size: 16px;
       max-width: 1200px;
       margin: 0 auto;
     }
   }
   
   /* Desktop and up */
   @media (min-width: 1280px) {
     .container {
       padding: 32px;
     }
   }

**Material-UI Breakpoints:**

.. code-block:: jsx

   import { useTheme, useMediaQuery } from '@mui/material';
   
   function ResponsiveComponent() {
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
     const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
     const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
     
     return (
       <Box
         sx={{
           padding: { xs: 2, sm: 3, md: 4 },
           fontSize: { xs: '14px', md: '16px' },
           display: { xs: 'block', md: 'flex' },
         }}
       >
         {isMobile && <MobileLayout />}
         {isTablet && <TabletLayout />}
         {isDesktop && <DesktopLayout />}
       </Box>
     );
   }

Grid Systems
------------

Flexible Grid Layout
~~~~~~~~~~~~~~~~~~~~

**CSS Grid:**

.. code-block:: css

   .grid-container {
     display: grid;
     grid-template-columns: repeat(12, 1fr);
     gap: 24px;
     padding: 24px;
   }
   
   .grid-item {
     grid-column: span 12; /* Full width on mobile */
   }
   
   @media (min-width: 960px) {
     .grid-item {
       grid-column: span 6; /* Half width on tablet */
     }
   }
   
   @media (min-width: 1280px) {
     .grid-item {
       grid-column: span 4; /* Third width on desktop */
     }
   }

**Material-UI Grid:**

.. code-block:: jsx

   import { Grid, Container } from '@mui/material';
   
   function ResponsiveGrid() {
     return (
       <Container maxWidth="xl">
         <Grid container spacing={3}>
           <Grid item xs={12} sm={6} md={4} lg={3}>
             <Card>Content 1</Card>
           </Grid>
           <Grid item xs={12} sm={6} md={4} lg={3}>
             <Card>Content 2</Card>
           </Grid>
           <Grid item xs={12} sm={6} md={4} lg={3}>
             <Card>Content 3</Card>
           </Grid>
           <Grid item xs={12} sm={6} md={4} lg={3}>
             <Card>Content 4</Card>
           </Grid>
         </Grid>
       </Container>
     );
   }

Flexbox Patterns
~~~~~~~~~~~~~~~~

.. code-block:: css

   /* Responsive flex layout */
   .flex-container {
     display: flex;
     flex-wrap: wrap;
     gap: 16px;
   }
   
   .flex-item {
     flex: 1 1 100%; /* Stack on mobile */
     min-width: 280px;
   }
   
   @media (min-width: 960px) {
     .flex-item {
       flex: 1 1 calc(50% - 16px); /* Two columns on tablet */
     }
   }
   
   @media (min-width: 1280px) {
     .flex-item {
       flex: 1 1 calc(33.333% - 16px); /* Three columns on desktop */
     }
   }

Typography
----------

Responsive Font Sizing
~~~~~~~~~~~~~~~~~~~~~~~

**Fluid Typography:**

.. code-block:: css

   /* Using clamp() for fluid scaling */
   h1 {
     font-size: clamp(1.5rem, 4vw, 3rem);
     line-height: 1.2;
   }
   
   h2 {
     font-size: clamp(1.25rem, 3vw, 2.5rem);
   }
   
   body {
     font-size: clamp(0.875rem, 1.5vw, 1rem);
     line-height: 1.6;
   }

**Breakpoint-Based Scaling:**

.. code-block:: jsx

   const theme = createTheme({
     typography: {
       h1: {
         fontSize: '2rem',
         '@media (min-width:960px)': {
           fontSize: '2.5rem',
         },
         '@media (min-width:1280px)': {
           fontSize: '3rem',
         },
       },
     },
   });

Images and Media
----------------

Responsive Images
~~~~~~~~~~~~~~~~~

**HTML Picture Element:**

.. code-block:: html

   <picture>
     <source 
       media="(min-width: 1280px)" 
       srcset="image-large.jpg"
     />
     <source 
       media="(min-width: 960px)" 
       srcset="image-medium.jpg"
     />
     <img 
       src="image-small.jpg" 
       alt="Responsive image"
       loading="lazy"
     />
   </picture>

**CSS Background Images:**

.. code-block:: css

   .hero {
     background-image: url('hero-small.jpg');
     background-size: cover;
     background-position: center;
   }
   
   @media (min-width: 960px) {
     .hero {
       background-image: url('hero-medium.jpg');
     }
   }
   
   @media (min-width: 1280px) {
     .hero {
       background-image: url('hero-large.jpg');
     }
   }

**React Responsive Images:**

.. code-block:: jsx

   function ResponsiveImage({ alt, sizes }) {
     return (
       <img
         src={sizes.default}
         srcSet={`
           ${sizes.small} 600w,
           ${sizes.medium} 960w,
           ${sizes.large} 1280w
         `}
         sizes="(max-width: 600px) 100vw,
                (max-width: 960px) 80vw,
                1200px"
         alt={alt}
         loading="lazy"
         style={{ width: '100%', height: 'auto' }}
       />
     );
   }

Navigation Patterns
-------------------

Mobile Navigation
~~~~~~~~~~~~~~~~~

**Hamburger Menu:**

.. code-block:: jsx

   import { useState } from 'react';
   import { 
     AppBar, 
     Toolbar, 
     IconButton, 
     Drawer,
     List,
     ListItem,
     useMediaQuery,
     useTheme 
   } from '@mui/material';
   import MenuIcon from '@mui/icons-material/Menu';
   
   function ResponsiveNav() {
     const [drawerOpen, setDrawerOpen] = useState(false);
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('md'));
     
     return (
       <>
         <AppBar position="sticky">
           <Toolbar>
             <Logo />
             {isMobile ? (
               <>
                 <IconButton 
                   edge="end" 
                   color="inherit"
                   onClick={() => setDrawerOpen(true)}
                 >
                   <MenuIcon />
                 </IconButton>
                 <Drawer
                   anchor="right"
                   open={drawerOpen}
                   onClose={() => setDrawerOpen(false)}
                 >
                   <MobileMenu onClose={() => setDrawerOpen(false)} />
                 </Drawer>
               </>
             ) : (
               <DesktopMenu />
             )}
           </Toolbar>
         </AppBar>
       </>
     );
   }

Tables and Data Display
-----------------------

Responsive Tables
~~~~~~~~~~~~~~~~~

**Scrollable Tables:**

.. code-block:: jsx

   import { TableContainer, Paper } from '@mui/material';
   
   function ResponsiveTable() {
     return (
       <TableContainer 
         component={Paper}
         sx={{
           maxWidth: '100%',
           overflowX: 'auto',
         }}
       >
         <Table sx={{ minWidth: 650 }}>
           {/* Table content */}
         </Table>
       </TableContainer>
     );
   }

**Card-Based Mobile Layout:**

.. code-block:: jsx

   function ResponsiveDataDisplay({ data }) {
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
     
     if (isMobile) {
       return (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           {data.map(item => (
             <Card key={item.id}>
               <CardContent>
                 <Typography variant="h6">{item.title}</Typography>
                 <Typography variant="body2">{item.description}</Typography>
               </CardContent>
             </Card>
           ))}
         </Box>
       );
     }
     
     return <DataTable data={data} />;
   }

Forms
-----

Responsive Form Layouts
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: jsx

   function ResponsiveForm() {
     return (
       <Box
         component="form"
         sx={{
           display: 'grid',
           gridTemplateColumns: {
             xs: '1fr',
             sm: 'repeat(2, 1fr)',
             md: 'repeat(3, 1fr)',
           },
           gap: 2,
           padding: 2,
         }}
       >
         <TextField label="First Name" fullWidth />
         <TextField label="Last Name" fullWidth />
         <TextField 
           label="Email" 
           fullWidth 
           sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }}
         />
         <TextField 
           label="Address" 
           fullWidth 
           multiline
           rows={3}
           sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }}
         />
         <Button 
           variant="contained" 
           sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }}
         >
           Submit
         </Button>
       </Box>
     );
   }

Touch Optimization
------------------

Touch Targets
~~~~~~~~~~~~~

Ensure interactive elements are large enough for touch:

.. code-block:: css

   /* Minimum touch target size */
   .button,
   .link,
   .interactive {
     min-height: 44px;
     min-width: 44px;
     padding: 12px 16px;
   }
   
   /* Spacing between touch targets */
   .button-group button {
     margin: 8px;
   }

**Material-UI Touch Ripple:**

.. code-block:: jsx

   <Button
     variant="contained"
     sx={{
       minHeight: 44,
       minWidth: 44,
       padding: '12px 24px',
     }}
     TouchRippleProps={{
       style: { color: 'rgba(0, 0, 0, 0.3)' }
     }}
   >
     Touch Optimized Button
   </Button>

Performance Optimization
------------------------

Viewport Configuration
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

   <!-- In public/index.html -->
   <meta 
     name="viewport" 
     content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
   />

Lazy Loading
~~~~~~~~~~~~

.. code-block:: jsx

   import { lazy, Suspense } from 'react';
   
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   
   function App() {
     return (
       <Suspense fallback={<Loading />}>
         <HeavyComponent />
       </Suspense>
     );
   }

CSS Optimization
~~~~~~~~~~~~~~~~

.. code-block:: css

   /* Use CSS containment for performance */
   .card {
     contain: layout style paint;
   }
   
   /* Hardware acceleration for animations */
   .animated {
     will-change: transform;
     transform: translateZ(0);
   }

Testing Responsive Designs
---------------------------

Browser DevTools
~~~~~~~~~~~~~~~~

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test different device presets
4. Test custom dimensions
5. Test network throttling

Automated Testing
~~~~~~~~~~~~~~~~~

.. code-block:: javascript

   // Using Cypress for responsive testing
   describe('Responsive Layout', () => {
     const sizes = ['iphone-6', 'ipad-2', [1280, 720]];
     
     sizes.forEach(size => {
       it(`displays correctly on ${size}`, () => {
         if (Cypress._.isArray(size)) {
           cy.viewport(size[0], size[1]);
         } else {
           cy.viewport(size);
         }
         
         cy.visit('/');
         cy.get('.main-nav').should('be.visible');
         cy.screenshot(`${size}-viewport`);
       });
     });
   });

Best Practices
--------------

✅ **DO:**

- Start with mobile design
- Use relative units (rem, em, %)
- Test on real devices
- Optimize images for different sizes
- Use CSS containment
- Implement touch-friendly interactions
- Test with slow network speeds

❌ **DON'T:**

- Use fixed pixel widths
- Ignore small screen sizes
- Load desktop-sized images on mobile
- Make touch targets too small
- Use hover-only interactions
- Forget about landscape orientation
- Assume screen dimensions

Common Patterns
---------------

Dashboard Layout
~~~~~~~~~~~~~~~~

.. code-block:: jsx

   function ResponsiveDashboard() {
     return (
       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
         <Sidebar 
           sx={{ 
             width: { xs: '100%', md: 240 },
             borderRight: { xs: 'none', md: '1px solid #e0e0e0' }
           }} 
         />
         <Box sx={{ flex: 1, padding: { xs: 2, md: 3 } }}>
           <Grid container spacing={{ xs: 2, md: 3 }}>
             <Grid item xs={12} sm={6} lg={3}>
               <StatCard />
             </Grid>
             {/* More grid items */}
           </Grid>
         </Box>
       </Box>
     );
   }

Content with Sidebar
~~~~~~~~~~~~~~~~~~~~

.. code-block:: jsx

   function ContentLayout() {
     return (
       <Container maxWidth="xl">
         <Grid container spacing={3}>
           <Grid item xs={12} md={8}>
             <MainContent />
           </Grid>
           <Grid item xs={12} md={4}>
             <Sidebar />
           </Grid>
         </Grid>
       </Container>
     );
   }

Resources
---------

**Tools:**

- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack for real device testing
- Lighthouse for performance auditing

**Further Reading:**

- :doc:`/frontend/index` - Frontend development guide
- MDN Responsive Design Guide
- Google Web Fundamentals

.. note::
   Continuously test your responsive designs on real devices and various browsers to ensure the best user experience.
