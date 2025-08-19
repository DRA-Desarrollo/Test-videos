import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useVideoStore } from '../../store/videoStore';
import { TestProgressBar } from '../ProgressBars';
import Test from '../Test/Test';
import { supabase } from '../../utils/supabaseClient';
import { useAuthStore } from '../../store/authStore';

interface VideoCardProps {
  videoId: string;
  title: string;
  youtubeUrl: string;
}

const toEmbedUrl = (url: string): string => {
  try {
    if (url.includes('/embed/')) return url;
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('shorts');
      if (idx !== -1 && parts[idx + 1]) {
        return `https://www.youtube.com/embed/${parts[idx + 1]}`;
      }
    }
  } catch {}
  return url;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const VideoCard: React.FC<VideoCardProps> = ({ videoId, title, youtubeUrl }) => {
  const { userTestCompletions, getTestProgress } = useVideoStore();
  const { user } = useAuthStore();
  const completion = userTestCompletions.find(c => c.video_id === videoId);
  const testPassed = completion?.passed;
  const testPercent = getTestProgress(videoId);
  const embedUrl = toEmbedUrl(youtubeUrl);

  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [errorQuestions, setErrorQuestions] = useState<string | null>(null);

  const openTest = async () => {
    setShowQuestions(true);
    setLoadingQuestions(true);
    setErrorQuestions(null);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('video_id', videoId);
    if (error) {
      setErrorQuestions(error.message);
      setQuestions([]);
    } else {
      setQuestions(data ? shuffle(data) : []);
    }
    setLoadingQuestions(false);
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>{title}</Typography>
        <Box sx={{ mb: 1 }}>
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 */ }}>
            <iframe
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                borderRadius: 12,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </Box>
        </Box>
        <TestProgressBar percent={testPercent} />
        {!testPassed ? (
          <Button variant="contained" color="primary" onClick={openTest}>
            Hacer Test
          </Button>
        ) : (
          <Typography color="success.main" variant="subtitle1">
            ¡Test aprobado! No puedes repetirlo.
          </Typography>
        )}

        <Dialog open={showQuestions} onClose={() => setShowQuestions(false)} maxWidth="md" fullWidth>
          <DialogTitle>Test</DialogTitle>
          <DialogContent dividers>
            {loadingQuestions ? (
              <Typography variant="body2" color="text.secondary">Cargando preguntas...</Typography>
            ) : errorQuestions ? (
              <Typography color="error.main">Error: {errorQuestions}</Typography>
            ) : questions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay preguntas disponibles.</Typography>
            ) : (
              <Test userId={user?.id || ''} videoId={videoId} questions={questions} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuestions(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
