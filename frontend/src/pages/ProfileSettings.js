import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Tabs, 
  Tab, 
  Box, 
  TextField, 
  Button, 
  Card, 
  Typography, 
  IconButton, 
  Avatar, 
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import { getProfile, updateProfile, changePassword } from '../services/api';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // User profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(prev => ({
          ...prev,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone_number,
          address: data.address
        }));
      } catch (err) {}
    }
    fetchProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Save personal details except email
  const handleSavePersonalDetails = async () => {
    if (!profile.fullName) {
      setSnackbar({
        open: true,
        message: 'Name is required',
        severity: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address
      });
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update profile',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!profile.oldPassword || !profile.newPassword || !profile.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'All password fields are required',
        severity: 'error'
      });
      return;
    }
    if (profile.newPassword !== profile.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      await changePassword(profile.oldPassword, profile.newPassword);
      setProfile(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update password',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => setOpenDialog(true);
  const handleCloseDeleteDialog = () => setOpenDialog(false);

  const handleDeleteAccount = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Account scheduled for deletion',
        severity: 'info'
      });
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="profile-settings-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Typography variant="h4" className="page-header">
          My Profile
        </Typography>
        <Card className="profile-card">
          <Box className="profile-avatar-container">
            <Avatar className="profile-avatar" src="/profile-placeholder.png" />
            <IconButton className="profile-avatar-edit-button">
              <CameraAltIcon />
            </IconButton>
          </Box>
          <Box className="profile-info">
            <Typography variant="h6" className="profile-card-header">
              {profile.fullName}
            </Typography>
            <Typography variant="body1" className="profile-card-subheader">
              {profile.email}
            </Typography>
          </Box>
        </Card>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          className="profile-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<PersonIcon />} 
            iconPosition="start"
            label="Personal Details" 
            className={activeTab === 0 ? 'profile-tab profile-tab-active' : 'profile-tab profile-tab-inactive'} 
          />
          <Tab 
            icon={<SecurityIcon />} 
            iconPosition="start"
            label="Security" 
            className={activeTab === 1 ? 'profile-tab profile-tab-active' : 'profile-tab profile-tab-inactive'} 
          />
        </Tabs>
        {/* Tab Contents */}
        {activeTab === 0 && (
          <Box className="profile-form">
            <TextField 
              label="Full Name" 
              fullWidth 
              margin="normal" 
              name="fullName"
              value={profile.fullName} 
              onChange={handleInputChange}
              required
            />
            <TextField 
              label="Email" 
              fullWidth 
              margin="normal" 
              name="email"
              value={profile.email} 
              InputProps={{ readOnly: true }}
              disabled
            />
            <TextField 
              label="Phone" 
              fullWidth 
              margin="normal" 
              name="phone"
              value={profile.phone} 
              onChange={handleInputChange}
            />
            <TextField 
              label="Address" 
              fullWidth 
              margin="normal" 
              name="address"
              value={profile.address} 
              onChange={handleInputChange}
              multiline
              rows={2}
            />
            <Box className="profile-form-actions">
              <Button 
                variant="contained" 
                className="profile-form-button profile-form-button-save"
                onClick={handleSavePersonalDetails}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        )}
        {activeTab === 1 && (
          <Box className="profile-form">
            <TextField 
              label="Old Password" 
              type="password" 
              fullWidth 
              margin="normal"
              name="oldPassword"
              value={profile.oldPassword}
              onChange={handleInputChange}
              required
            />
            <TextField 
              label="New Password" 
              type="password" 
              fullWidth 
              margin="normal"
              name="newPassword"
              value={profile.newPassword}
              onChange={handleInputChange}
              required
            />
            <TextField 
              label="Confirm Password" 
              type="password" 
              fullWidth 
              margin="normal"
              name="confirmPassword"
              value={profile.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <Box className="profile-form-actions">
              <Button 
                variant="contained" 
                className="profile-form-button profile-form-button-save"
                onClick={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Password'}
              </Button>
            </Box>
          </Box>
        )}
        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle className="dialog-title">
            <WarningIcon className="dialog-warning-icon" />
            Delete Account
          </DialogTitle>
          <DialogContent>
            <DialogContentText className="dialog-content-text">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </DialogContentText>
          </DialogContent>
        </Dialog>
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ProfileSettings;