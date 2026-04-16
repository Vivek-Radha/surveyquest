import express from 'express';
import User from '../models/User.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

// Get overview stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSurveys = await Survey.countDocuments();
    const totalResponses = await Response.countDocuments();
    res.json({ totalUsers, totalSurveys, totalResponses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Surveys
router.get('/surveys', async (req, res) => {
  try {
    const surveys = await Survey.find({}).populate('creator', 'name email');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/surveys/:id', async (req, res) => {
  try {
    await Survey.findByIdAndDelete(req.params.id);
    await Response.deleteMany({ survey: req.params.id });
    res.json({ message: 'Survey and related responses deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logs - View all Responses
router.get('/responses', async (req, res) => {
  try {
    const responses = await Response.find()
      .populate('survey', 'title _id')
      .populate('respondent', 'name email')
      .sort('-createdAt')
      .limit(100); // For demo limit to 100
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
