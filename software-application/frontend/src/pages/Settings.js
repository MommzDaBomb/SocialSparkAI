import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, Switch, FormControlLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Settings = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    fullName: Yup.string()
      .required('Full name is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: 'user@example.com',
      fullName: 'John Doe',
      notifyEmail: true,
      notifyPush: true,
      defaultAiModel: 'chatgpt',
      defaultTone: 'professional',
      autoSchedule: true,
      autoApprove: false,
      darkMode: false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Settings saved:', values);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                label="Full Name"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
                margin="normal"
              />
              
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
              />
              
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </Paper>
          </Grid>
          
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifyEmail}
                    onChange={(e) => formik.setFieldValue('notifyEmail', e.target.checked)}
                    name="notifyEmail"
                  />
                }
                label="Email notifications for content approval"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifyPush}
                    onChange={(e) => formik.setFieldValue('notifyPush', e.target.checked)}
                    name="notifyPush"
                  />
                }
                label="Push notifications for content approval"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Notification Preferences
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.autoApprove}
                    onChange={(e) => formik.setFieldValue('autoApprove', e.target.checked)}
                    name="autoApprove"
                  />
                }
                label="Auto-approve content (not recommended)"
              />
            </Paper>
          </Grid>
          
          {/* Content Default Settings */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Default Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="defaultAiModel"
                    name="defaultAiModel"
                    label="Default AI Model"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    value={formik.values.defaultAiModel}
                    onChange={formik.handleChange}
                    margin="normal"
                  >
                    <option value="chatgpt">ChatGPT (OpenAI)</option>
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="perplexity">Perplexity</option>
                    <option value="poppyai">PoppyAI</option>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="defaultTone"
                    name="defaultTone"
                    label="Default Content Tone"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    value={formik.values.defaultTone}
                    onChange={formik.handleChange}
                    margin="normal"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="humorous">Humorous</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="educational">Educational</option>
                  </TextField>
                </Grid>
              </Grid>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.autoSchedule}
                    onChange={(e) => formik.setFieldValue('autoSchedule', e.target.checked)}
                    name="autoSchedule"
                  />
                }
                label="Auto-schedule content for optimal posting times"
              />
            </Paper>
          </Grid>
          
          {/* API Connections */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                API Connections
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">OpenAI API</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Status: Connected
                    </Typography>
                    <Button size="small" variant="outlined">Configure</Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Social Media Accounts</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      4 platforms connected
                    </Typography>
                    <Button size="small" variant="outlined">Manage</Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Image Generation</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Status: Connected
                    </Typography>
                    <Button size="small" variant="outlined">Configure</Button>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Interface Settings */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interface Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.darkMode}
                    onChange={(e) => formik.setFieldValue('darkMode', e.target.checked)}
                    name="darkMode"
                  />
                }
                label="Dark Mode"
              />
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
          >
            Save Settings
          </Button>
          
          {saveSuccess && (
            <Typography variant="body2" color="success.main">
              Settings saved successfully!
            </Typography>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default Settings;
