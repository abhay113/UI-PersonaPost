// components/ChatComponent.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    AppBar, Avatar, Box, Container, IconButton, Menu, MenuItem,
    Paper, Stack, TextField, Toolbar, Typography, Snackbar, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { TypingIndicator } from './TypingIndicator';

interface Message {
    text: string;
    sender: 'user' | 'bot';
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

        const userMsg: Message = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMsg]);

        const question = input;
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:3000/api/v1/prediction/71cc8ea2-c145-4032-80e5-51ef3bf3fb82', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
                },
                body: JSON.stringify({ question }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            const botReply = data?.text || `Sorry, I didn't understand that.`;

            // Add a small delay for better UX
            await new Promise((resolve) => setTimeout(resolve, 500));

            const botMsg: Message = { text: botReply, sender: 'bot' };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Flowise bot error:', error);
            setMessages((prev) => [...prev, {
                text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
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
        <Box display="flex" flexDirection="column" height="100vh" bgcolor="#e3f2fd">
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

            {alert && (
                <Snackbar
                    open={Boolean(alert)}
                    autoHideDuration={4000}
                    onClose={handleCloseAlert}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseAlert}
                        severity={alert.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {alert.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default ChatComponent;