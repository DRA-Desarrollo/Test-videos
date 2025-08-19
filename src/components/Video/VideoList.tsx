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

  const passedIds = new Set((userTestCompletions || []).filter((c: any) => c.passed).map((c: any) => c.video_id));
  const visibleVideos = videos.filter(v => v.id === currentVideoId || passedIds.has(v.id));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          {visibleVideos.map((video) => (
            <VideoCard key={video.id} videoId={video.id} title={video.title} youtubeUrl={video.youtube_url} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoList;
