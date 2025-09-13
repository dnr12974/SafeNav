import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  fetchContacts,
  addContact,
  updateContact,
  deleteContact
} from '../services/api';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  IconButton, 
  Modal, 
  TextField, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const EmergencyContacts = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({ name: '', phone: '', relationship: '', id: null });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Simulate loading data from API
  useEffect(() => {
    setLoading(true);
    fetchContacts()
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(() => {
        setContacts([]);
        setLoading(false);
      });
  }, []);

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setModalData({ ...contact });
    } else {
      setModalData({ name: '', phone: '', relationship: '', id: null });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = async () => {
    if (!modalData.name || !modalData.phone) {
      setSnackbar({
        open: true,
        message: 'Name and phone number are required',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      if (modalData.id) {
        // Update existing contact
        await updateContact({
          id: modalData.id,
          name: modalData.name,
          phone: modalData.phone,
          relationship: modalData.relationship
        });
        setSnackbar({
          open: true,
          message: 'Contact updated successfully',
          severity: 'success'
        });
      } else {
        // Add new contact
        await addContact({
          name: modalData.name,
          phone_number: modalData.phone,
          relationship: modalData.relationship
        });
        setSnackbar({
          open: true,
          message: 'Contact added successfully',
          severity: 'success'
        });
      }
      // Refresh contacts
      const updatedContacts = await fetchContacts();
      setContacts(updatedContacts);
      setOpenModal(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const handleDeleteContact = async (name) => {
    setLoading(true);
    try {
      await deleteContact(name);
      setSnackbar({
        open: true,
        message: 'Contact deleted successfully',
        severity: 'success'
      });
      // Refresh contacts
      const updatedContacts = await fetchContacts();
      setContacts(updatedContacts);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCallContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessageContact = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  return (
    <div className="emergency-contacts-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar />

        {/* Header */}
        <Typography variant="h4" className="page-header">
          My Emergency Contacts
        </Typography>

        {/* Add New Contact Button */}
        <Button 
          variant="contained" 
          className="add-contact-button"
          onClick={() => handleOpenModal(null)}
          startIcon={<AddIcon />}
          disabled={loading}
        >
          Add New Contact
        </Button>

        {/* Contact Cards */}
        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
          </Box>
        ) : contacts.length === 0 ? (
          <Box className="empty-state">
            <Typography variant="h6">
              No emergency contacts added yet
            </Typography>
            <Typography variant="body1">
              Add your emergency contacts to quickly reach them in case of emergency
            </Typography>
          </Box>
        ) : (
          <Box className="grid-container">
            {contacts.map((contact) => (
              <Card key={contact.id} className="contact-card animated-card">
                <CardContent>
                  <Typography variant="h6" className="contact-card-header">
                    {contact.name}
                  </Typography>
                  <Typography variant="body1" className="contact-card-subheader">
                    {contact.phone}
                  </Typography>
                  <Typography variant="body2" className="contact-card-subheader">
                    Relationship: {contact.relationship}
                  </Typography>
                  <Box className="contact-card-actions">
                    <IconButton 
                      className="contact-card-action-button" 
                      onClick={() => handleCallContact(contact.phone)}
                    >
                      <PhoneIcon />
                    </IconButton>
                    <IconButton 
                      className="contact-card-action-button"
                      onClick={() => handleMessageContact(contact.phone)}
                    >
                      <MessageIcon />
                    </IconButton>
                    <IconButton 
                      className="contact-card-action-button"
                      onClick={() => handleOpenModal(contact)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      className="contact-card-action-button contact-card-delete"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Modal for Adding/Editing Contact */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box className="modal">
            <Typography variant="h6" className="modal-header">
              {modalData.id ? 'Edit Contact' : 'Add New Contact'}
            </Typography>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="normal"
              value={modalData.name}
              onChange={handleInputChange}
              required
              className="modal-input"
              placeholder="Enter contact name"
            />
            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              margin="normal"
              value={modalData.phone}
              onChange={handleInputChange}
              required
              className="modal-input"
              placeholder="Enter phone number"
            />
            <TextField
              label="Relationship"
              name="relationship"
              fullWidth
              margin="normal"
              value={modalData.relationship}
              onChange={handleInputChange}
              className="modal-input"
              placeholder="E.g. Family, Friend, etc."
            />
            <Box className="modal-actions">
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveContact}
                className="modal-save-button"
              >
                {modalData.id ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Box>
        </Modal>

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

export default EmergencyContacts;