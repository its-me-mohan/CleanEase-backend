
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');



router.get('/notifications', auth, async (req, res) => {
  try {
    
    const notifications = await Notification.find({ user: req.user.id, date: { $lt: new Date() } });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});



module.exports = router;