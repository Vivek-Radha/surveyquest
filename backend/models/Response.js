import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answerText: { type: String }, // For text or MCQ option
  ratingValue: { type: Number } // For rating
});

const responseSchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, could be anonymous
  answers: [answerSchema]
}, { timestamps: true });

export default mongoose.model('Response', responseSchema);
