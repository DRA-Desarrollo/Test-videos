import React from 'react';
import { useVideoStore } from '../../store/videoStore';

const VideoSidebar: React.FC = () => {
  const { videos, currentVideoId } = useVideoStore();

  if (!videos || videos.length === 0) return null;

  return (
    <aside
      style={{
        flex: '0 0 220px',
        maxWidth: 220,
        borderRight: '1px solid #e0e0e0',
        padding: 12,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: 16 }}>Módulos</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {videos.map((v) => {
          const isCurrent = v.id === currentVideoId;
          return (
            <li key={v.id} style={{ marginBottom: 10 }}>
              <span
                style={{
                  fontWeight: isCurrent ? 700 : 400,
                  fontSize: 14,
                  display: '-webkit-box',
                  WebkitLineClamp: 3 as any,
                  WebkitBoxOrient: 'vertical' as any,
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: '1.2',
                }}
              >
                {v.order}. {v.title}
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default VideoSidebar;
