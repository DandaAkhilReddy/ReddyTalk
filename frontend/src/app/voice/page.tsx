'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Settings,
  VolumeUp,
  VolumeOff,
  Help,
  Refresh
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import VoiceRecorder from '../../components/VoiceRecorder';
import ConversationHistory, { Message } from '../../components/ConversationHistory';
import VoiceVisualizer from '../../components/VoiceVisualizer';

// Services
import AudioService from '../../services/AudioService';
import ApiService from '../../services/ApiService';

// Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif',
  },
});

interface AppState {
  sessionId: string | null;
  messages: Message[];
  isProcessing: boolean;
  processingStage: string;
  error: string | null;
  audioLevel: number;
  isRecording: boolean;
  isMuted: boolean;
  backendHealthy: boolean;
}

export default function VoiceAssistantPage() {
  const [state, setState] = useState<AppState>({
    sessionId: null,
    messages: [],
    isProcessing: false,
    processingStage: '',
    error: null,
    audioLevel: 0,
    isRecording: false,
    isMuted: false,
    backendHealthy: false,
  });

  // Services
  const [audioService] = useState(() => new AudioService());
  const [apiService] = useState(() => new ApiService(
    process.env.NEXT_PUBLIC_API_URL || '/api'
  ));

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check browser audio support
        const audioSupport = AudioService.checkAudioSupport();
        if (!audioSupport.supported) {
          setState(prev => ({
            ...prev,
            error: `Browser not supported: ${audioSupport.issues.join(', ')}`,
          }));
          return;
        }

        // Check backend health
        await checkBackendHealth();

        // Start session
        await startNewSession();

        showSnackbar('Voice assistant ready!', 'success');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize voice assistant',
        }));
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      audioService.cleanup();
      if (state.sessionId) {
        apiService.endSession(state.sessionId);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      await apiService.healthCheck();
      setState(prev => ({ ...prev, backendHealthy: true }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        backendHealthy: false,
        error: 'Backend service unavailable. Using demo mode.',
      }));
    }
  };

  // Start new session
  const startNewSession = async () => {
    try {
      const session = await apiService.startSession();
      setState(prev => ({ ...prev, sessionId: session.sessionId }));
    } catch (error) {
      console.error('Failed to start session:', error);
      // Create demo session
      setState(prev => ({ ...prev, sessionId: `demo-${Date.now()}` }));
    }
  };

  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle recording completion
  const handleRecordingComplete = useCallback(async (audioBlob: Blob, duration: number) => {
    if (!state.sessionId) {
      showSnackbar('Session not ready. Please refresh the page.', 'error');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingStage: 'Processing audio...',
      isRecording: false,
    }));

    try {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        text: state.backendHealthy ? 'Processing...' : 'Demo: This is what you said!',
        timestamp: new Date(),
        duration,
      };

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, userMessage],
        processingStage: 'Getting AI response...',
      }));

      if (state.backendHealthy) {
        // Process with real backend
        const conversationHistory = state.messages.map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

        const result = await apiService.processVoiceMessage(
          audioBlob,
          state.sessionId,
          conversationHistory
        );

        // Update user message with transcription
        const updatedUserMessage: Message = {
          ...userMessage,
          text: result.transcription.text,
        };

        // Create AI response message
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          text: result.aiResponse.text,
          timestamp: new Date(),
          audioUrl: result.audioUrl,
        };

        setState(prev => ({ 
          ...prev, 
          messages: prev.messages.map(msg => 
            msg.id === userMessage.id ? updatedUserMessage : msg
          ).concat(aiMessage),
        }));

        // Play AI response audio (if not muted)
        if (!state.isMuted && result.audioUrl) {
          try {
            await audioService.playAudio(result.audioUrl);
          } catch (audioError) {
            console.error('Failed to play audio response:', audioError);
            showSnackbar('Audio playback failed', 'warning');
          }
        }
      } else {
        // Demo mode
        setTimeout(() => {
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            text: 'Hello! This is a demo response. Your voice assistant is working! To enable full functionality, please set up the Azure backend services.',
            timestamp: new Date(),
          };

          setState(prev => ({ 
            ...prev, 
            messages: prev.messages.concat(aiMessage),
          }));
        }, 2000);
      }

      showSnackbar('Response received!', 'success');

    } catch (error) {
      console.error('Error processing voice message:', error);
      showSnackbar(
        error instanceof Error ? error.message : 'Failed to process voice message',
        'error'
      );

      // Remove the processing user message on error
      setState(prev => ({ 
        ...prev, 
        messages: prev.messages.filter(msg => msg.text !== 'Processing...'),
      }));
    } finally {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processingStage: '',
      }));
    }
  }, [state.sessionId, state.backendHealthy, state.messages, state.isMuted, apiService, audioService]);

  // Handle audio playback
  const handlePlayAudio = useCallback(async (messageId: string, audioUrl: string) => {
    try {
      // Update message to show it's playing
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, isPlaying: true } : { ...msg, isPlaying: false }
        ),
      }));

      const audio = await audioService.playAudio(audioUrl);
      
      audio.onended = () => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? { ...msg, isPlaying: false } : msg
          ),
        }));
      };

    } catch (error) {
      console.error('Failed to play audio:', error);
      showSnackbar('Failed to play audio', 'error');
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, isPlaying: false } : msg
        ),
      }));
    }
  }, [audioService]);

  // Handle stop audio
  const handleStopAudio = useCallback((messageId: string) => {
    audioService.stopCurrentAudio();
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, isPlaying: false } : msg
      ),
    }));
  }, [audioService]);

  // Clear conversation history
  const handleClearHistory = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
    showSnackbar('Conversation cleared', 'info');
  }, []);

  // Toggle mute
  const toggleMute = () => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    showSnackbar(
      state.isMuted ? 'Audio enabled' : 'Audio muted', 
      'info'
    );
  };

  // Refresh app
  const refreshApp = () => {
    window.location.reload();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🗣️ ReddyTalk.ai - Voice Assistant
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={state.isMuted ? 'Unmute responses' : 'Mute responses'}>
              <IconButton color="inherit" onClick={toggleMute}>
                {state.isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh app">
              <IconButton color="inherit" onClick={refreshApp}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton color="inherit">
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Status Alerts */}
        {state.error && (
          <Alert severity={state.backendHealthy ? "error" : "warning"} sx={{ mb: 2 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
            {state.error}
          </Alert>
        )}

        {/* Main Grid Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Voice Recorder & Visualizer */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Voice Visualizer */}
              <VoiceVisualizer
                isRecording={state.isRecording}
                audioLevel={state.audioLevel}
              />
              
              {/* Voice Recorder */}
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                disabled={state.isProcessing}
              />
              
              {/* Status Info */}
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  {state.isProcessing ? (
                    `🔄 ${state.processingStage}`
                  ) : state.sessionId ? (
                    `✅ Ready - ${state.backendHealthy ? 'Live' : 'Demo'} Mode`
                  ) : (
                    '⏳ Initializing...'
                  )}
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Conversation History */}
          <Grid item xs={12} md={7}>
            <ConversationHistory
              messages={state.messages}
              onPlayAudio={handlePlayAudio}
              onStopAudio={handleStopAudio}
              onClearHistory={handleClearHistory}
              maxHeight={500}
            />
          </Grid>
        </Grid>

        {/* Help FAB */}
        <Fab
          color="primary"
          size="medium"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => showSnackbar('Click the record button and speak clearly. AI will respond!', 'info')}
        >
          <Help />
        </Fab>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}