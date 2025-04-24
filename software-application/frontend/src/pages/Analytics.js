import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Sample data for analytics
const engagementData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'LinkedIn',
      data: [1200, 1900, 3000, 5000, 4000, 6500],
      borderColor: '#0077B5',
      backgroundColor: 'rgba(0, 119, 181, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Twitter',
      data: [2500, 3500, 4500, 3500, 5500, 6000],
      borderColor: '#1DA1F2',
      backgroundColor: 'rgba(29, 161, 242, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Instagram',
      data: [3000, 4000, 5000, 7000, 6000, 8000],
      borderColor: '#E1306C',
      backgroundColor: 'rgba(225, 48, 108, 0.1)',
      tension: 0.4,
    },
  ],
};

const contentTypeData = {
  labels: ['Blog Posts', 'Social Posts', 'Videos', 'Carousels', 'Articles'],
  datasets: [
    {
      label: 'Engagement by Content Type',
      data: [12500, 19000, 25000, 18000, 15000],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const platformDistributionData = {
  labels: ['LinkedIn', 'Twitter', 'Instagram', 'Facebook', 'YouTube', 'TikTok'],
  datasets: [
    {
      label: 'Audience Distribution',
      data: [35, 25, 20, 10, 7, 3],
      backgroundColor: [
        'rgba(0, 119, 181, 0.6)',
        'rgba(29, 161, 242, 0.6)',
        'rgba(225, 48, 108, 0.6)',
        'rgba(66, 103, 178, 0.6)',
        'rgba(255, 0, 0, 0.6)',
        'rgba(0, 0, 0, 0.6)',
      ],
      borderColor: [
        'rgba(0, 119, 181, 1)',
        'rgba(29, 161, 242, 1)',
        'rgba(225, 48, 108, 1)',
        'rgba(66, 103, 178, 1)',
        'rgba(255, 0, 0, 1)',
        'rgba(0, 0, 0, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const topPerformingContent = [
  { id: 1, title: '10 AI Trends to Watch in 2025', platform: 'LinkedIn', type: 'Article', engagement: 15250, impressions: 45000 },
  { id: 2, title: 'How to Optimize Your Content Strategy', platform: 'Twitter', type: 'Thread', engagement: 12800, impressions: 38000 },
  { id: 3, title: 'Behind the Scenes: Content Creation', platform: 'Instagram', type: 'Carousel', engagement: 10500, impressions: 32000 },
  { id: 4, title: 'The Future of Social Media Marketing', platform: 'YouTube', type: 'Video', engagement: 8900, impressions: 25000 },
  { id: 5, title: 'Case Study: Successful Brand Transformation', platform: 'LinkedIn', type: 'Post', engagement: 7500, impressions: 22000 },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Overview" />
          <Tab label="Content Performance" />
          <Tab label="Audience Insights" />
          <Tab label="Growth Metrics" />
        </Tabs>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Engagement
                  </Typography>
                  <Typography variant="h3" color="primary">
                    78.5K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +15.2% from previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Impressions
                  </Typography>
                  <Typography variant="h3" color="primary">
                    245K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +22.8% from previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Content Created
                  </Typography>
                  <Typography variant="h3" color="primary">
                    42
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +8.5% from previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Avg. Engagement Rate
                  </Typography>
                  <Typography variant="h3" color="primary">
                    4.2%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +0.5% from previous period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Engagement Chart */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Engagement Trends by Platform
                </Typography>
                <Box sx={{ height: 350 }}>
                  <Line 
                    data={engagementData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            
            {/* Platform Distribution */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Platform Distribution
                </Typography>
                <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Pie 
                    data={platformDistributionData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            
            {/* Content Type Performance */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Performance by Content Type
                </Typography>
                <Box sx={{ height: 350 }}>
                  <Bar 
                    data={contentTypeData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            
            {/* Top Performing Content */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Content
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Engagement</TableCell>
                        <TableCell align="right">Impressions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPerformingContent.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell component="th" scope="row">
                            {row.title}
                          </TableCell>
                          <TableCell>{row.platform}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell align="right">{row.engagement.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.impressions.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Content Performance Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Content Performance Analysis
          </Typography>
          <Typography variant="body1">
            Detailed content performance metrics will be displayed here.
          </Typography>
        </Box>
      )}
      
      {/* Audience Insights Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Audience Insights
          </Typography>
          <Typography variant="body1">
            Detailed audience demographics and behavior metrics will be displayed here.
          </Typography>
        </Box>
      )}
      
      {/* Growth Metrics Tab */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Growth Metrics
          </Typography>
          <Typography variant="body1">
            Detailed growth and trend analysis will be displayed here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Analytics;
