import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

const TakeSurvey = () => {
  const { shareLink } = useParams();
  const [survey, setSurvey] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await api.getSurveyByLink(shareLink);
        setSurvey(data);
      } catch (err) {
        console.error(err);
        alert('Survey not found!');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [shareLink]);

  if (loading) return <div className="text-center mt-20 text-primary-600 animate-pulse font-medium">Loading survey details...</div>;
  if (!survey) return <div className="text-center mt-20 text-red-500 font-medium">Error: Invalid Survey URL.</div>;

  const question = survey.questions[currentIdx];
  const progress = ((currentIdx) / survey.questions.length) * 100;

  const handleNext = async () => {
    if (currentIdx < survey.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      try {
        await api.submitResponse(survey._id, answers);
        setIsSubmitted(true);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const setAnswer = (questionId, value) => {
    const existing = answers.find(a => a.questionId === questionId);
    let newAnswers = [...answers];
    if (existing) {
      newAnswers = newAnswers.map(a => a.questionId === questionId ? { ...a, [question.type === 'Rating' ? 'ratingValue' : 'answerText']: value } : a);
    } else {
      newAnswers.push({
        questionId,
        ...(question.type === 'Rating' ? { ratingValue: value } : { answerText: value })
      });
    }
    setAnswers(newAnswers);
  };

  const getCurrentAnswer = (questionId) => {
    const ans = answers.find(a => a.questionId === questionId);
    if (!ans) return null;
    return question.type === 'Rating' ? ans.ratingValue : ans.answerText;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-dark-800 text-center max-w-md p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
        >
          <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Survey Completed</h2>
          <p className="text-gray-500 dark:text-gray-400">Thank you for submitting your response!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">{survey.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{survey.description}</p>
      </div>

      <div className="w-full bg-gray-200 dark:bg-dark-800 rounded-full h-2.5 mb-12 overflow-hidden shadow-inner">
        <motion.div 
          className="bg-primary-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIdx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-800 p-10 min-h-[350px] flex flex-col justify-center rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800"
        >
          <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm mb-6 uppercase tracking-widest block">
            Question {currentIdx + 1} of {survey.questions.length}
          </span>
          <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white leading-tight">{question.questionText}</h2>

          {question.type === 'Text' && (
            <input 
              type="text" 
              className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xl transition-shadow text-gray-900 dark:text-gray-100"
              placeholder="Type your answer..."
              value={getCurrentAnswer(question._id) || ''}
              onChange={(e) => setAnswer(question._id, e.target.value)}
            />
          )}

          {question.type === 'MCQ' && (
            <div className="space-y-4">
              {question.options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => setAnswer(question._id, opt)}
                  className={`w-full text-left px-6 py-5 rounded-xl border-2 transition-all font-medium text-lg ${
                    getCurrentAnswer(question._id) === opt 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-md transform scale-[1.01]' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === 'Rating' && (
            <div className="flex justify-center gap-4 py-6">
              {[...Array(question.maxRating || 5)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setAnswer(question._id, i + 1)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all shadow-sm ${
                    getCurrentAnswer(question._id) === i + 1
                      ? 'bg-primary-600 text-white transform scale-110 shadow-lg shadow-primary-500/40'
                      : 'bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-10">
        <button 
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button 
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all font-bold text-lg"
        >
          {currentIdx === survey.questions.length - 1 ? 'Submit Responses' : 'Continue'} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TakeSurvey;
