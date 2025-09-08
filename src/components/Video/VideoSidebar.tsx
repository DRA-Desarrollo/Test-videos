import React, { useState } from 'react';
import { Box, Typography, CardMedia, CardActionArea } from '@mui/material';
import { motion } from 'framer-motion';
import type { Video } from '../../types/video';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '') || null;
      }
      if (u.searchParams.has('v')) {
        return u.searchParams.get('v');
      }
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.findIndex(p => p === 'embed');
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      return null;
    } catch (_) {
      return null;
    }
  };

  const videoId = extractYouTubeId(video.youtube_url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  const [embedFailed, setEmbedFailed] = useState(false);

  const handleEmbedError = () => {
    setEmbedFailed(true);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      border: 1, 
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Header con información del video */}
      <Box sx={{ p: 0.5, backgroundColor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontSize: '0.8rem', lineHeight: 1.1 }}>
          {video.title}
        </Typography>
      </Box>

      {/* Área del video */}
      <Box sx={{ flex: 1, backgroundColor: '#000', minHeight: 200, position: 'relative' }}>
        {!embedFailed && embedUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%', height: '100%' }}
          >
            <iframe
              src={embedUrl}
              title={video.title}
              onError={handleEmbedError}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                border: 'none' 
              }}
            />
          </motion.div>
        ) : (
          <CardActionArea 
            component="a" 
            href={video.youtube_url} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              textDecoration: 'none'
            }}
          >
            {thumbnailUrl ? (
              <>
                <CardMedia
                  component="img"
                  image={thumbnailUrl}
                  alt={video.title}
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 0, 
                        height: 0, 
                        borderTop: '9px solid transparent',
                        borderBottom: '9px solid transparent',
                        borderLeft: '15px solid #ff0000',
                        marginLeft: '3px'
                      }}
                    />
                  </motion.div>
                </motion.div>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'white',
                textAlign: 'center',
                p: 2,
                flexDirection: 'column',
                gap: 1
              }}>
                <Typography variant="body1" sx={{ fontSize: '0.9rem' }}>
                  Ver video en YouTube
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  (Haz clic para abrir)
                </Typography>
              </Box>
            )}
          </CardActionArea>
        )}
      </Box>
    </Box>
  );
};

export default VideoCard;
