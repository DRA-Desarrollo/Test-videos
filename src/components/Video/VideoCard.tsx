import React, { useState } from 'react';
import { Box, Typography, CardMedia } from '@mui/material';
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

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Abrir el video en la misma pestaña
    window.open(video.youtube_url, '_self');
  };

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', // Asegurar que ocupe todo el ancho
      display: 'flex', 
      flexDirection: 'column',
      border: 1, 
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Header con información del video - altura mínima */}
      <Box sx={{ 
        p: 1, 
        backgroundColor: 'background.paper', 
        flexShrink: 0,
        minHeight: '40px' // Altura mínima para el título
      }}>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', lineHeight: 1.2, fontWeight: 500 }}>
          {video.title}
        </Typography>
      </Box>

      {/* Área del video - ocupa todo el espacio restante */}
      <Box sx={{ 
        flex: 1, 
        backgroundColor: '#000', 
        position: 'relative',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!embedFailed && embedUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'relative'
            }}
          >
            <iframe
              src={embedUrl}
              title={video.title}
              onError={handleEmbedError}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          </motion.div>
        ) : (
          <Box
            onClick={handleVideoClick}
            sx={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              textDecoration: 'none',
              position: 'relative',
              backgroundColor: '#000'
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
                  style={{ 
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
                    style={{ 
                      width: 64, // Más grande
                      height: 64, // Más grande
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 0, 
                        height: 0, 
                        borderTop: '12px solid transparent', // Más grande
                        borderBottom: '12px solid transparent', // Más grande
                        borderLeft: '20px solid #ff0000', // Más grande
                        marginLeft: '4px'
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
                width: '100%',
                color: 'white',
                textAlign: 'center',
                p: 3,
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                  Ver video en YouTube
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  (Haz clic para abrir)
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VideoCard;