import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Create as CreateIcon, 
  CalendarToday as CalendarIcon, 
  BarChart as AnalyticsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

// Sample data for dashboard
const pendingContent = [
  { id: 1, title: 'LinkedIn Post: AI Trends 2025', platform: 'LinkedIn', type: 'Post', dueDate: '2025-04-25' },
  { id: 2, title: 'Instagram Carousel: Digital Marketing Tips', platform: 'Instagram', type: 'Carousel', dueDate: '2025-04-26' },
  { id: 3, title: 'YouTube Script: Content Creation Tools', platform: 'YouTube', type: 'Video Script', dueDate: '2025-04-28' }
];

const recentPerformance = [
  { id: 1, title: 'Twitter Thread: Future of AI', platform: 'Twitter', engagement: 1250, impressions: 15000 },
  { id: 2, title: 'LinkedIn Article: Remote Work Trends', platform: 'LinkedIn', engagement: 850, impressions: 9500 },
  { id: 3, title: 'Facebook Post: Customer Service Tips', platform: 'Facebook', engagement: 650, impressions: 7800 }
];

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<CreateIcon />}>
                Create New Content
              </Button>
              <Button variant="outlined" startIcon={<CalendarIcon />}>
                View Calendar
              </Button>
              <Button variant="outlined" startIcon={<AnalyticsIcon />}>
                View Analytics
              </Button>
              <Button variant="outlined" startIcon={<NotificationsIcon />}>
                Notifications
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Content Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <DashboardIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" component="div">
                12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Content Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <CalendarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" component="div">
                8
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled Posts This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <AnalyticsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" component="div">
                24.5K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Impressions This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pending Content Approval */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Pending Content Approval
            </Typography>
            {pendingContent.map((item) => (
              <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle1">{item.title}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.platform} • {item.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {item.dueDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button size="small" variant="contained">Approve</Button>
                  <Button size="small" variant="outlined">Edit</Button>
                  <Button size="small" color="error">Reject</Button>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
        
        {/* Recent Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Content Performance
            </Typography>
            {recentPerformance.map((item) => (
              <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle1">{item.title}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.platform}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Engagement:</strong> {item.engagement}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Impressions:</strong> {item.impressions}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
