// components/ChatComponent.tsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    AppBar, Avatar, Box, Container, IconButton, Menu, MenuItem,
    Paper, Stack, TextField, Toolbar, Typography, Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TypingIndicator } from './TypingIndicator';
import ImageModal from './ImageModal'; // Import the new ImageModal component
import AppAlert from './AlertComponent';

interface Message {
    text: string;
    sender: 'user' | 'bot';
    imageUrl?: string | null; // Add imageUrl to message interface
}

const ChatComponent: React.FC = () => {
    const navigate = useNavigate();

    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const stored = localStorage.getItem('chatMessages');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [input, setInput] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
    const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const userName = localStorage.getItem('full_name') || 'User';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        try {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        } catch (error) {
            console.error('Failed to save messages to localStorage:', error);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const question = input;
        const userMsg: Message = { text: question, sender: 'user' };
        setMessages((prev) => [...prev, userMsg]);

        setInput('');
        setIsTyping(true);
        const userSessionId = localStorage.getItem('session_id'); // Make sure this key matches what you set
        const full_name = localStorage.getItem('full_name') || 'User'; // Get full name from localStorage
        const flowise_url = `${import.meta.env.VITE_FLOWISE_URL}`;
        try {
            const flowiseResponse = await axios.post(
                flowise_url,
                {
                    question,
                    overrideConfig: { // This object is essential
                        sessionId: userSessionId,
                        full_name: full_name// The key MUST be 'sessionId'

                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const flowiseText = flowiseResponse.data?.text || `Sorry, I didn't understand that.`;
            let combinedText = flowiseText;
            let generatedImageUrl = null;

            // If input includes "image", get image URL and append
            if (question.toLowerCase().includes('image')) {
                const imageUrl = await handleImageGeneration(question);
                if (imageUrl) {
                    generatedImageUrl = imageUrl;
                    combinedText += `\n\n**🖼️ Image generated successfully!**`;
                } else {
                    combinedText += `\n\n🚫 Failed to generate image.`;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
            const botMsg: Message = {
                text: combinedText,
                sender: 'bot',
                imageUrl: generatedImageUrl  // Store the image URL in the message
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Flowise bot error:', error);
            setMessages((prev) => [...prev, {
                text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                sender: 'bot',
            }]);
        } finally {
            setIsTyping(false);
        }
    };
    const generate_url = `${import.meta.env.VITE_GENERATE_URL}`;
    const handleImageGeneration = async (question: string): Promise<string | null> => {
        try {
            const session_id = localStorage.getItem('session_id');

            const response = await axios.post(
                generate_url,
                {
                    session_id,
                    input: question,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const imageUrl = response.data?.image_url;
            return imageUrl || null;
        } catch (error) {
            console.error('Image generation error:', error);
            return null;
        }
    };

    // Function to handle clicking the image button in chat
    const handleImageClick = (imageUrl: string) => {
        setImageModalUrl(imageUrl);
        setIsImageModalOpen(true);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseAlert = () => setAlert(null);

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isOnboarded');
        localStorage.removeItem('full_name');
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('session_id');
        setAlert({ message: 'Logged out successfully', severity: 'success' });

        setTimeout(() => {
            navigate('/auth');
        }, 1200);
    };

    const handleMenuClose = (action?: 'logout' | 'profile' | 'clear') => {
        setAnchorEl(null);

        if (action === 'logout') {
            handleLogout();
        } else if (action === 'profile') {
            setAlert({ message: 'Profile View Clicked', severity: 'success' });
        } else if (action === 'clear') {
            setMessages([]);
            setAlert({ message: 'Chat cleared', severity: 'success' });
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            height="100vh"
            sx={{
                backgroundImage: 'url(/bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >

            <AppBar position="static" color="primary">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">
                        PersonaPost
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" color="inherit">
                            Hi, {userName}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {userName[0].toUpperCase()}
                        </Avatar>
                        <IconButton color="inherit" onClick={handleMenuClick}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => handleMenuClose()}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem onClick={() => handleMenuClose('profile')}>
                                <PersonIcon sx={{ mr: 1 }} />
                                View Profile
                            </MenuItem>
                            <MenuItem onClick={() => handleMenuClose('clear')}>
                                Clear Chat
                            </MenuItem>
                            <MenuItem onClick={() => handleMenuClose('logout')}>
                                <LogoutIcon sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container
                maxWidth="md"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    py: 2,
                    overflow: 'hidden',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        bgcolor: '#ffffff',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            px: 2,
                            py: 2,
                            scrollBehavior: 'smooth',
                            minHeight: 0,
                        }}
                    >
                        {messages.length === 0 && (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                height="100%"
                                flexDirection="column"
                            >
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Welcome to PersonaPost!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Start a conversation by typing a message below.
                                </Typography>
                            </Box>
                        )}

                        {messages.map((msg, idx) => (
                            <Box
                                key={idx}
                                display="flex"
                                justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                                my={1.5}
                            >
                                <Paper
                                    elevation={2}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        maxWidth: '70%',
                                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.200',
                                        color: msg.sender === 'user' ? '#fff' : 'text.primary',
                                        borderRadius: 2,
                                    }}
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        children={DOMPurify.sanitize(msg.text)}
                                    />

                                    {/* Add clickable image button if message has imageUrl */}
                                    {msg.imageUrl && (
                                        <Box mt={1}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ImageIcon />}
                                                onClick={() => handleImageClick(msg.imageUrl!)}
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    textTransform: 'none',
                                                    borderColor: msg.sender === 'user' ? '#fff' : 'primary.main',
                                                    color: msg.sender === 'user' ? '#fff' : 'primary.main',
                                                    '&:hover': {
                                                        borderColor: msg.sender === 'user' ? '#fff' : 'primary.dark',
                                                        bgcolor: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(25,118,210,0.04)',
                                                    }
                                                }}
                                            >
                                                View Generated Image
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        ))}

                        {isTyping && (
                            <Box display="flex" justifyContent="flex-start" my={1.5}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        maxWidth: '70%',
                                        bgcolor: 'grey.200',
                                        color: 'text.primary',
                                        borderRadius: 2,
                                        fontStyle: 'italic',
                                    }}
                                >
                                    <TypingIndicator />
                                </Paper>
                            </Box>
                        )}
                        <div ref={bottomRef} />
                    </Box>

                    <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                fullWidth
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                variant="outlined"
                                multiline
                                maxRows={4}
                                disabled={isTyping}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={isTyping || !input.trim()}
                            >
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                </Paper>
            </Container>

            <AppAlert alert={alert} onClose={handleCloseAlert} />
            {/* Image Modal Component */}
            <ImageModal
                isOpen={isImageModalOpen}
                imageUrl={imageModalUrl || ''} // Pass the URL to the modal
                onClose={() => setIsImageModalOpen(false)}
            />
        </Box>
    );
};

export default ChatComponent;