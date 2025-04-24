import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Sample content data
const initialEvents = [
  {
    id: '1',
    title: 'LinkedIn Post: AI Trends',
    start: '2025-04-24',
    backgroundColor: '#3f51b5',
    borderColor: '#3f51b5',
    extendedProps: {
      platform: 'LinkedIn',
      contentType: 'Post',
      status: 'scheduled'
    }
  },
  {
    id: '2',
    title: 'Instagram Carousel: Marketing Tips',
    start: '2025-04-25',
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
    extendedProps: {
      platform: 'Instagram',
      contentType: 'Carousel',
      status: 'scheduled'
    }
  },
  {
    id: '3',
    title: 'Twitter Thread: Tech News',
    start: '2025-04-26',
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
    extendedProps: {
      platform: 'Twitter',
      contentType: 'Thread',
      status: 'scheduled'
    }
  },
  {
    id: '4',
    title: 'YouTube Video: Product Review',
    start: '2025-04-28',
    backgroundColor: '#f44336',
    borderColor: '#f44336',
    extendedProps: {
      platform: 'YouTube',
      contentType: 'Video',
      status: 'scheduled'
    }
  },
  {
    id: '5',
    title: 'Facebook Post: Customer Stories',
    start: '2025-04-29',
    backgroundColor: '#4267B2',
    borderColor: '#4267B2',
    extendedProps: {
      platform: 'Facebook',
      contentType: 'Post',
      status: 'scheduled'
    }
  }
];

const ContentCalendar = () => {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleDateSelect = (selectInfo) => {
    // In a real application, this would open a modal to create new content
    const title = prompt('Please enter a title for your content:');
    if (title) {
      const newEvent = {
        id: String(events.length + 1),
        title,
        start: selectInfo.startStr,
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        extendedProps: {
          platform: 'Draft',
          contentType: 'Post',
          status: 'draft'
        }
      };
      setEvents([...events, newEvent]);
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
          {eventInfo.event.extendedProps.platform}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {eventInfo.event.title}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Content Calendar
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          View and manage your scheduled content across all platforms. Click on a date to schedule new content or click on an existing item to view details.
        </Typography>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
        />
      </Paper>
      
      {selectedEvent && (
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Content Details
          </Typography>
          <Typography variant="body1">
            <strong>Title:</strong> {selectedEvent.title}
          </Typography>
          <Typography variant="body1">
            <strong>Platform:</strong> {selectedEvent.extendedProps.platform}
          </Typography>
          <Typography variant="body1">
            <strong>Content Type:</strong> {selectedEvent.extendedProps.contentType}
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong> {new Date(selectedEvent.start).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            <strong>Status:</strong> {selectedEvent.extendedProps.status}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ContentCalendar;
