import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
export type AlertState = {
    message: string;
    severity: AlertColor;
};

interface AppAlertProps {
    alert: AlertState | null;
    onClose: () => void;
    duration?: number;
}

const AppAlert: React.FC<AppAlertProps> = ({ alert, onClose, duration = 4000 }) => {
    return (
        <Snackbar open={!!alert}

            autoHideDuration={duration}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            {alert ? (
                <Alert onClose={onClose} severity={alert.severity} variant="filled" sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            ) : undefined}
        </Snackbar>
    );
};

export default AppAlert;
