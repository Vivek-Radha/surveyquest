import express from 'express';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import { protect } from '../middleware/authMiddleware.js';
import { emailService } from '../services/emailService.js';
import User from '../models/User.js';

const router = express.Router();

// Get community public surveys (Protected, global feed)
router.get('/community', protect, async (req, res) => {
  try {
    const surveys = await Survey.find({ isPublic: true })
      .populate('creator', 'name')
      .sort('-createdAt');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lookup survey by 6-digit Join Code
router.get('/join/:code', async (req, res) => {
  try {
    const survey = await Survey.findOne({ joinCode: req.params.code.toUpperCase() }).select('-creator');
    if (!survey) return res.status(404).json({ message: 'Invalid or expired Survey Code' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a survey (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, questions, isPublic } = req.body;
    const shareLink = Math.random().toString(36).substring(2, 10);
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 Character Code
    
    const survey = await Survey.create({
      title, 
      description, 
      questions, 
      creator: req.user.id, 
      shareLink,
      isPublic: isPublic !== undefined ? isPublic : true,
      joinCode
    });
    
    // Emit global event for real-time dashboard updates
    req.io.emit('newSurvey', survey);
    
    // Alert the creator
    const creatorUser = await User.findById(req.user.id);
    if (creatorUser) emailService.sendSurveyCreated(creatorUser.email, survey.title);

    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's surveys (Protected)
router.get('/my-surveys', protect, async (req, res) => {
  try {
    const surveys = await Survey.find({ creator: req.user.id }).sort('-createdAt');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modify existing Survey Template (Protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, questions, isPublic } = req.body;
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    if (survey.creator.toString() !== req.user.id) {
       return res.status(403).json({ message: 'unauthorized to modify this survey' });
    }

    survey.title = title || survey.title;
    if (description !== undefined) survey.description = description;
    if (questions) survey.questions = questions;
    if (isPublic !== undefined) survey.isPublic = isPublic;

    await survey.save();
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete specific response out of the Logs table
router.delete('/responses/:id', protect, async (req, res) => {
    try {
        const response = await Response.findById(req.params.id).populate('survey');
        if (!response) return res.status(404).json({message: 'Response sequence not found in cluster'});
        
        // Ensure either they own the survey or they are an admin instance
        if (response.survey.creator.toString() !== req.user.id && req.user.role !== 'admin') {
           return res.status(403).json({message: 'Not authorized to purge this response log'});
        }

        await Response.findByIdAndDelete(req.params.id);
        res.json({ message: 'Response securely purged from cluster' });
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
});

// Get public survey by old share link (Public)
router.get('/link/:shareLink', async (req, res) => {
  try {
    const survey = await Survey.findOne({ shareLink: req.params.shareLink }).select('-creator');
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit response (Public/Optional Auth)
router.post('/:id/responses', async (req, res) => {
  try {
    const { answers, respondentId } = req.body;
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    const response = await Response.create({
      survey: survey._id,
      respondent: respondentId || null,
      answers
    });
    
    // Emit event for real-time dashboard update
    req.io.emit('newResponse', { surveyId: survey._id, response });
    
    // Alert the admin/creator
    const creatorUser = await User.findById(survey.creator);
    if (creatorUser) emailService.sendResponseAlert(creatorUser.email, survey.title);

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get responses for a survey (Protected - only creator or admin)
router.get('/:id/responses', protect, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    
    if (survey.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const responses = await Response.find({ survey: req.params.id }).populate('respondent', 'name email');
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
