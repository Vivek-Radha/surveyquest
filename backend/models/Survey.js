import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['MCQ', 'Text', 'Rating', 'Checkbox', 'Dropdown', 'Date'], required: true },
  questionText: { type: String, required: true },
  options: [{ type: String }], // Used for MCQ
  maxRating: { type: Number, default: 5 } // Used for Rating
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  isActive: { type: Boolean, default: true },
  shareLink: { type: String, unique: true },
  isPublic: { type: Boolean, default: true },
  joinCode: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export default mongoose.model('Survey', surveySchema);
