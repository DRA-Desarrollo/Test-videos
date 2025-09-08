import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import type { Video } from '../../types/video';

interface VideoSidebarProps {
  video: Video | null;
  videos: Video[];
  currentVideoId: string | null;
  userTestCompletions: Array<{video_id: string; passed: boolean}>;
  onVideoSelect: (videoId: string) => void;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ video, videos, currentVideoId, userTestCompletions, onVideoSelect }) => {
  
  const canNavigateToVideo = (videoId: string) => {
    const completion = userTestCompletions.find(c => c.video_id === videoId);
    return completion?.passed;
  };

  const handleVideoClick = (videoId: string) => {
    if (canNavigateToVideo(videoId) || videoId === currentVideoId) {
      onVideoSelect(videoId);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
        {video ? `Módulos del curso` : 'Selecciona un video'}
      </Typography>
      
      <List sx={{ width: '100%' }}>
        {videos.map((videoItem) => {
          const canNavigate = canNavigateToVideo(videoItem.id);
          const isCurrent = videoItem.id === currentVideoId;
          
          return (
            <ListItem key={videoItem.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleVideoClick(videoItem.id)}
                selected={isCurrent}
                disabled={!canNavigate && !isCurrent}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isCurrent ? 'bold' : 'normal',
                        fontSize: '0.85rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {videoItem.order}. {videoItem.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.75rem', opacity: 0.8 }}
                    >
                      Video {videoItem.order} de {videos.length}
                      {!canNavigate && !isCurrent && ' 🔒'}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default VideoSidebar;