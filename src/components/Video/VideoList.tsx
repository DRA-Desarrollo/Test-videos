import React, { useEffect } from 'react';
import VideoCard from './VideoCard';
import { useVideoStore } from '../../store/videoStore';

const VideoList: React.FC = () => {
  const { videos, loadingVideos, errorVideos, currentVideoId, userTestCompletions } = useVideoStore();

  if (loadingVideos) {
    return <div>Cargando videos...</div>;
  }

  if (errorVideos) {
    return <div style={{ color: 'red' }}>Error: {errorVideos}</div>;
  }

  // Fallback robusto: si no hay currentVideoId aún, usar el primer video si existe
  const current = currentVideoId
    ? videos.find(v => v.id === currentVideoId)
    : (videos.length > 0 ? videos[0] : undefined);

  if (!current) {
    return <div>No hay videos en este curso.</div>;
  }

  const passedIds = new Set((userTestCompletions || []).filter((c: any) => c.passed).map((c: any) => c.video_id));
  const visibleVideos = [current, ...videos.filter(v => v.id !== current.id && passedIds.has(v.id))];

console.log('_Videos:', videos);
console.log('_Current Video ID:', currentVideoId);
console.log('_User Test Completions:', userTestCompletions);
console.log('_Passed IDs:', passedIds);
console.log('_Visible Videos:', visibleVideos);  
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          {visibleVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoList;
