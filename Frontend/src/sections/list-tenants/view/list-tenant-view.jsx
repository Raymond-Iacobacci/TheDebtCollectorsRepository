import PropTypes from 'prop-types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';

// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@material-ui/core';

import DialogTitle from '@mui/material/DialogTitle';
import { TextField } from '@material-ui/core';

// import Typography from '@mui/material/Typography';

export default function ListTenantView({ managerID }) {
    const [open, setOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    const openPopup = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false); // Close the dialog
    };
    const createTenant = async () => {
        await fetch(
            `${import.meta.env.VITE_MIDDLEWARE_URL}/manager/create-tenant?manager-id=${managerID}`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: `${firstName}`,
                    lastName: `${lastName}`,
                    email: `${email}`,
                    address: `${address}`,
                }),
            }
        );
        handleClose();
    };

    return (
        <Container>
            <Button component="label" variant="contained" onClick={openPopup}>
                Create Tenant
            </Button>
            <Dialog open={open} onClose={handleClose} sx={{ textAlign: 'center'}} >
                <Grid container justifyContent="center">
                    <Grid>
                        <Box sx={{ padding: '20px' }}>
                            <Grid item xs={12}>
                                <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', borderBottom: '2px solid #000000' }}>New Tenant</DialogTitle>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={firstName}
                                    label="First Name"
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={lastName}
                                    label="Last Name"
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField value={email} label="Email" onChange={(e) => setEmail(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    value={address}
                                    label="Address"
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ marginTop: '20px' }}>
                                <Button component="label" variant="contained" onClick={createTenant}>
                                    Submit
                                </Button>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Dialog>
        </Container>
    );
}

ListTenantView.propTypes = {
    managerID: PropTypes.string,
};
