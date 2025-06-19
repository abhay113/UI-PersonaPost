import React, { useState, useRef, useEffect } from 'react';
import {
    AppBar, Avatar, Box, Container, IconButton, Menu, MenuItem,
    Paper, Stack, TextField, Toolbar, Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { TypingIndicator } from './TypingIndicator';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(() => {
        const stored = localStorage.getItem('chatMessages');
        return stored ? JSON.parse(stored) : [];
    });

    const [input, setInput] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const userName = 'John Doe';

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Save messages to localStorage on change
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            const data = await res.json();
            const botReply = data?.text || 'Sorry, I didn’t understand that.';

            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay

            const botMsg: Message = { text: botReply, sender: 'bot' };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Flowise bot error:', error);
            setMessages((prev) => [...prev, { text: 'Error communicating with Flowise bot.', sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (action?: 'logout' | 'profile') => {
        setAnchorEl(null);
        if (action === 'logout') {
            localStorage.removeItem('chatMessages');
            setMessages([]);
            navigate('/');
        } else if (action === 'profile') {
            alert('View profile clicked');
        }
    };

    return (
        <Box display="flex" flexDirection="column" height="100vh" bgcolor="#e3f2fd">
            {/* Navbar */}
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
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose()}>
                            <MenuItem onClick={() => handleMenuClose('profile')}>View Profile</MenuItem>
                            <MenuItem onClick={() => handleMenuClose('logout')}>Logout</MenuItem>
                        </Menu>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Chat Area */}
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
                    {/* Messages */}
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

                        {/* Typing Animation */}
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

                    {/* Input Area */}
                    <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                fullWidth
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                variant="outlined"
                            />
                            <IconButton color="primary" onClick={handleSend}>
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ChatComponent;
