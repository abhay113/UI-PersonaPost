// components/ImageModal.tsx
import React from 'react';
import { Box, Dialog, DialogContent, IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// Styled IconButton for better positioning of the close button
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
}));

interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
    isOpen: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose, isOpen }) => {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <StyledIconButton aria-label="close" onClick={onClose}>
                <CloseIcon />
            </StyledIconButton>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Generated Image
                </Typography>
                <Box
                    component="img"
                    src={imageUrl}
                    alt="Generated Content"
                    sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '70vh', // Limit height to prevent overly large images
                        display: 'block',
                        borderRadius: 2,
                        mb: 2,
                    }}
                />

            </DialogContent>
        </Dialog>
    );
};

export default ImageModal;