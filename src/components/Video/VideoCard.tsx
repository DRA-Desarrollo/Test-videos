import React from 'react';
import type { Video } from '../../types/video';

interface VideoCardProps {
  video: Video;
  // Aquí se añadirían props para el estado de desbloqueo/completado y puntuación
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <h3>{video.title}</h3>
      <p>Orden: {video.order}</p>
      <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
        Ver Video
      </a>
      {/* Aquí se mostraría el estado (bloqueado, desbloqueado, completado) y la puntuación */}
    </div>
  );
};

export default VideoCard;
