// components/OnboardComponent.tsx
import React, { useState } from 'react';
import type { AlertColor } from '@mui/material';
import {
    Box,
    Button,
    Chip,
    Container,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    Stack,
    Paper,
    Snackbar,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

const steps = ['Profession', 'Hobbies', 'Interests', 'Themes'];

const transitionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

type AlertState = {
    message: string;
    severity: AlertColor;
};

interface OnboardComponentProps {
    onOnboardSuccess: () => void;
}

const OnboardComponent: React.FC<OnboardComponentProps> = ({ onOnboardSuccess }) => {
    const navigate = useNavigate();

    // Get full name from localStorage instead of sessionStorage
    const fullName = localStorage.getItem('full_name') || 'User';

    const [activeStep, setActiveStep] = useState(0);
    const [profession, setProfession] = useState('');
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [themes, setThemes] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCloseAlert = () => setAlert(null);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleAdd = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (input.trim()) {
            setter((prev) => [...prev, input.trim()]);
            setInput('');
        }
    };

    const handleDelete = (
        index: number,
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        list: string[]
    ) => {
        setter(list.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (themes.length === 0) {
            setAlert({ message: 'Please add at least one theme to continue.', severity: 'warning' });
            return;
        }

        const payload = {
            name: fullName,
            profession,
            hobbies,
            interests,
            themes,
        };

        try {
            setLoading(true);

            await axios.post('http://localhost:3010/api/onboard/', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token if needed
                },
                withCredentials: true,
            });

            // Mark user as onboarded
            localStorage.setItem('isOnboarded', 'true');

            setAlert({ message: 'Onboarding complete! Redirecting...', severity: 'success' });

            // Update parent component state
            onOnboardSuccess();

            setTimeout(() => {
                navigate('/chat');
            }, 1200);

        } catch (error: any) {
            const message =
                error.response?.data?.message || error.message || 'Submission failed.';
            setAlert({ message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const renderChipInput = (
        label: string,
        list: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => (
        <>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                {list.map((item, index) => (
                    <Chip
                        key={index}
                        label={item}
                        onDelete={() => handleDelete(index, setter, list)}
                        color="primary"
                        sx={{ mb: 1 }}
                    />
                ))}
            </Stack>
            <TextField
                fullWidth
                label={label}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd(setter);
                    }
                }}
                margin="normal"
            />
            <Button
                onClick={() => handleAdd(setter)}
                variant="outlined"
                sx={{ mt: 1 }}
            >
                Add
            </Button>
        </>
    );

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Welcome, {fullName}! Please enter your profession
                        </Typography>
                        <TextField
                            fullWidth
                            label="Profession"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            margin="normal"
                            placeholder="e.g., Software Developer, Teacher, Designer"
                        />
                    </Box>
                );
            case 1:
                return (
                    <>
                        <Typography variant="h6" gutterBottom>
                            That's great! Now enter your hobbies
                        </Typography>
                        {renderChipInput('Add a hobby', hobbies, setHobbies)}
                    </>
                );
            case 2:
                return (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Awesome! What are your interests?
                        </Typography>
                        {renderChipInput('Add an interest', interests, setInterests)}
                    </>
                );
            case 3:
                return (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Lastly, which themes do you want to focus on?
                        </Typography>
                        {renderChipInput('Add a theme', themes, setThemes)}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            minHeight="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ background: 'linear-gradient(to right, #2196f3, #21cbf3)' }}
        >
            <Container maxWidth="md">
                <Paper elevation={4} sx={{ p: 6, borderRadius: 3 }}>
                    <Typography variant="h4" align="center" color="primary" gutterBottom>
                        PersonaPost Onboarding
                    </Typography>
                    <br />
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Box minHeight="200px">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                variants={transitionVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="space-between">
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                        >
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={themes.length === 0 || loading}
                            >
                                {loading ? 'Finishing...' : 'Finish'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={
                                    (activeStep === 0 && !profession.trim()) ||
                                    (activeStep === 1 && hobbies.length === 0) ||
                                    (activeStep === 2 && interests.length === 0)
                                }
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>

            {/* Snackbar Alert */}
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

export default OnboardComponent;