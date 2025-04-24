import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Lightbulb as LightbulbIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Sample AI models
const aiModels = [
  { id: 'chatgpt', name: 'ChatGPT (OpenAI)' },
  { id: 'claude', name: 'Claude (Anthropic)' },
  { id: 'perplexity', name: 'Perplexity' },
  { id: 'poppyai', name: 'PoppyAI' },
  { id: 'midjourney', name: 'Midjourney' },
  { id: 'flux', name: 'Flux' }
];

// Sample platforms
const platforms = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'twitter', name: 'X (Twitter)' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'tiktok', name: 'TikTok' }
];

// Sample content types
const contentTypes = [
  { id: 'blog', name: 'Blog Post' },
  { id: 'article', name: 'Article' },
  { id: 'social_post', name: 'Social Media Post' },
  { id: 'video_script', name: 'Video Script' },
  { id: 'audiogram', name: 'Audiogram Script' }
];

// Sample tones
const tones = [
  'Professional', 'Casual', 'Humorous', 'Inspirational', 
  'Educational', 'Conversational', 'Formal', 'Technical'
];

const ContentCreation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  
  const steps = ['Input Collection', 'Content Configuration', 'AI Selection', 'Review & Generate'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    formik.resetForm();
  };

  const generateSuggestedTopics = () => {
    setIsGeneratingTopics(true);
    
    // Simulate AI generating topics
    setTimeout(() => {
      setSuggestedTopics([
        'The Future of Remote Work in 2025',
        'How AI is Transforming Content Creation',
        '10 Social Media Trends to Watch',
        'Building a Personal Brand Online',
        'Effective Content Strategies for Small Businesses'
      ]);
      setIsGeneratingTopics(false);
    }, 1500);
  };

  const validationSchema = Yup.object({
    generalTopic: Yup.string()
      .required('Topic is required'),
    selectedPlatforms: Yup.array()
      .min(1, 'Select at least one platform')
      .required('Platforms are required'),
    contentTypes: Yup.array()
      .min(1, 'Select at least one content type')
      .required('Content types are required'),
    tone: Yup.string()
      .required('Tone is required'),
    preferredAiModel: Yup.string()
      .required('AI model selection is required'),
  });

  const formik = useFormik({
    initialValues: {
      generalTopic: '',
      selectedPlatforms: [],
      contentTypes: [],
      tone: '',
      keywords: [],
      currentKeyword: '',
      preferredAiModel: '',
      useVoiceSamples: false,
      voiceSampleFile: null,
      generateImages: true,
      scheduleContent: true,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      // In a real application, this would call an API endpoint to start content generation
      alert('Content generation started! You will be notified when content is ready for approval.');
      handleReset();
    },
  });

  const addKeyword = () => {
    if (formik.values.currentKeyword.trim() !== '' && 
        !formik.values.keywords.includes(formik.values.currentKeyword.trim())) {
      formik.setFieldValue('keywords', [...formik.values.keywords, formik.values.currentKeyword.trim()]);
      formik.setFieldValue('currentKeyword', '');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    formik.setFieldValue(
      'keywords', 
      formik.values.keywords.filter(keyword => keyword !== keywordToRemove)
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleTopicSelection = (topic) => {
    formik.setFieldValue('generalTopic', topic);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Topic Information
            </Typography>
            
            <TextField
              fullWidth
              id="generalTopic"
              name="generalTopic"
              label="General Topic or Idea"
              value={formik.values.generalTopic}
              onChange={formik.handleChange}
              error={formik.touched.generalTopic && Boolean(formik.errors.generalTopic)}
              helperText={formik.touched.generalTopic && formik.errors.generalTopic}
              margin="normal"
            />
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<LightbulbIcon />}
                onClick={generateSuggestedTopics}
                disabled={isGeneratingTopics}
              >
                {isGeneratingTopics ? 'Generating...' : 'Get Topic Suggestions'}
              </Button>
            </Box>
            
            {suggestedTopics.length > 0 && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Topics:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestedTopics.map((topic, index) => (
                    <Chip 
                      key={index} 
                      label={topic} 
                      onClick={() => handleTopicSelection(topic)} 
                      clickable 
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Voice & Style
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="tone-label">Content Tone</InputLabel>
              <Select
                labelId="tone-label"
                id="tone"
                name="tone"
                value={formik.values.tone}
                label="Content Tone"
                onChange={formik.handleChange}
                error={formik.touched.tone && Boolean(formik.errors.tone)}
              >
                {tones.map((tone) => (
                  <MenuItem key={tone} value={tone}>{tone}</MenuItem>
                ))}
              </Select>
              {formik.touched.tone && formik.errors.tone && (
                <Typography color="error" variant="caption">
                  {formik.errors.tone}
                </Typography>
              )}
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.useVoiceSamples}
                    onChange={(e) => formik.setFieldValue('useVoiceSamples', e.target.checked)}
                    name="useVoiceSamples"
                  />
                }
                label="Use writing samples to mimic my voice/style"
              />
              
              {formik.values.useVoiceSamples && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Writing Sample
                  <input
                    type="file"
                    hidden
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={(event) => {
                      formik.setFieldValue('voiceSampleFile', event.currentTarget.files[0]);
                    }}
                  />
                </Button>
              )}
              
              {formik.values.voiceSampleFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  File selected: {formik.values.voiceSampleFile.name}
                </Typography>
              )}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Target Platforms
            </Typography>
            
            <FormControl fullWidth margin="normal" error={formik.touched.selectedPlatforms && Boolean(formik.errors.selectedPlatforms)}>
              <InputLabel id="platforms-label">Select Platforms</InputLabel>
              <Select
                labelId="platforms-label"
                id="selectedPlatforms"
                name="selectedPlatforms"
                multiple
                value={formik.values.selectedPlatforms}
                onChange={formik.handleChange}
                label="Select Platforms"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const platform = platforms.find(p => p.id === value);
                      return <Chip key={value} label={platform ? platform.name : value} />;
                    })}
                  </Box>
                )}
              >
                {platforms.map((platform) => (
                  <MenuItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.selectedPlatforms && formik.errors.selectedPlatforms && (
                <Typography color="error" variant="caption">
                  {formik.errors.selectedPlatforms}
                </Typography>
              )}
            </FormControl>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Content Types
            </Typography>
            
            <FormControl fullWidth margin="normal" error={formik.touched.contentTypes && Boolean(formik.errors.contentTypes)}>
              <InputLabel id="content-types-label">Select Content Types</InputLabel>
              <Select
                labelId="content-types-label"
                id="contentTypes"
                name="contentTypes"
                multiple
                value={formik.values.contentTypes}
                onChange={formik.handleChange}
                label="Select Content Types"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const contentType = contentTypes.find(c => c.id === value);
                      return <Chip key={value} label={contentType ? contentType.name : value} />;
                    })}
                  </Box>
                )}
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.contentTypes && formik.errors.contentTypes && (
                <Typography color="error" variant="caption">
                  {formik.errors.contentTypes}
                </Typography>
              )}
            </FormControl>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Keywords (Optional)
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                id="currentKeyword"
                name="currentKeyword"
                label="Add Keyword"
                value={formik.values.currentKeyword}
                onChange={formik.handleChange}
                onKeyPress={handleKeyPress}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={addKeyword}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formik.values.keywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={() => removeKeyword(keyword)}
                />
              ))}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              AI Model Selection
            </Typography>
            
            <FormControl fullWidth margin="normal" error={formik.touched.preferredAiModel && Boolean(formik.errors.preferredAiModel)}>
              <InputLabel id="ai-model-label">Preferred AI Model</InputLabel>
              <Select
                labelId="ai-model-label"
                id="preferredAiModel"
                name="preferredAiModel"
                value={formik.values.preferredAiModel}
                onChange={formik.handleChange}
                label="Preferred AI Model"
              >
                {aiModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.preferredAiModel && formik.errors.preferredAiModel && (
                <Typography color="error" variant="caption">
                  {formik.errors.preferredAiModel}
                </Typography>
              )}
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              The selected AI model will be used for generating the main content. Different models may be used for specific aspects like image generation.
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Additional Options
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.generateImages}
                  onChange={(e) => formik.setFieldValue('generateImages', e.target.checked)}
                  name="generateImages"
                />
              }
              label="Generate images for content"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.scheduleContent}
                  onChange={(e) => formik.setFieldValue('scheduleContent', e.target.checked)}
                  name="scheduleContent"
                />
              }
              label="Schedule content automatically"
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Content Request
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Topic Information
                    </Typography>
                    <Typography variant="body1">
                      <strong>General Topic:</strong> {formik.values.generalTopic}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Tone:</strong> {formik.values.tone}
                    </Typography>
                    {formik.values.keywords.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1">
                          <strong>Keywords:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {formik.values.keywords.map((keyword, index) => (
                            <Chip key={index} label={keyword} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Content Configuration
                    </Typography>
                    <Typography variant="body1">
                      <strong>Platforms:</strong> {formik.values.selectedPlatforms.map(p => {
                        const platform = platforms.find(plat => plat.id === p);
                        return platform ? platform.name : p;
                      }).join(', ')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Content Types:</strong> {formik.values.contentTypes.map(c => {
                        const contentType = contentTypes.find(type => type.id === c);
                        return contentType ? contentType.name : c;
                      }).join(', ')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>AI Model:</strong> {(() => {
                        const model = aiModels.find(m => m.id === formik.values.preferredAiModel);
                        return model ? model.name : formik.values.preferredAiModel;
                      })()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Additional Settings
                    </Typography>
                    <Typography variant="body1">
                      <strong>Use Voice Samples:</strong> {formik.values.useVoiceSamples ? 'Yes' : 'No'}
                      {formik.values.voiceSampleFile && ` (${formik.values.voiceSampleFile.name})`}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Generate Images:</strong> {formik.values.generateImages ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Schedule Content:</strong> {formik.values.scheduleContent ? 'Yes' : 'No'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Content
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={formik.handleSubmit}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  type="submit"
                >
                  Generate Content
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ContentCreation;
