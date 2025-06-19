
import { Box } from '@mui/material';

export const TypingIndicator = () => (
    <Box display="flex" alignItems="center" pl={1}>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                height: '24px',
            }}
        >
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    sx={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'grey.500',
                        animation: 'typingAnimation 1.4s infinite',
                        animationDelay: `${i * 0.2}s`,
                        '@keyframes typingAnimation': {
                            '0%, 80%, 100%': {
                                transform: 'scale(0)',
                                opacity: 0.3,
                            },
                            '40%': {
                                transform: 'scale(1)',
                                opacity: 1,
                            },
                        },
                    }}
                />
            ))}
        </Box>
    </Box>
);
