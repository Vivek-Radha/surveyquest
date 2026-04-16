import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Save, Type, List, Star, CheckSquare, ChevronDown, Calendar, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const CreateSurvey = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      questionText: '',
      options: (type === 'MCQ' || type === 'Dropdown' || type === 'Checkbox') ? ['Option 1'] : [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  
  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleSave = async () => {
    if (!title || questions.length === 0) return toast.error('Survey needs a title and at least one question');
    const savingToast = toast.loading('Publishing survey to primary database...');
    setSaving(true);
    try {
      await api.createSurvey(title, description, questions, isPublic);
      toast.success('Survey published successfully!', { id: savingToast });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to publish survey', { id: savingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Survey Title..." 
          className="w-full bg-transparent text-4xl font-bold focus:outline-none border-b border-gray-200 dark:border-gray-700 focus:border-primary-500 pb-3 placeholder-gray-400 dark:placeholder-gray-600 mb-4 text-gray-900 dark:text-white transition-colors"
        />
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..." 
          className="w-full bg-transparent focus:outline-none text-gray-500 dark:text-gray-400 text-lg"
        />

        <div className="mt-8 flex items-center justify-between p-5 bg-gray-50 dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {isPublic ? <Globe className="w-5 h-5 text-blue-500"/> : <Lock className="w-5 h-5 text-indigo-500"/>}
              Visibility Element: {isPublic ? 'Public Feed' : 'Private via Access Code'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isPublic ? 'Anyone globally can view and join this survey on the community feed.' : 'Participants must be provided the 6-digit access pin code to join.'}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isPublic ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'}`}
          >
            <span className={`inline-block w-5 h-5 transform rounded-full bg-white transition-transform duration-300 ${isPublic ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {questions.map((q) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-primary-500"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-md text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {q.type} Field
                </span>
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Question Statement..." 
                value={q.questionText}
                onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow text-gray-900 dark:text-gray-100 font-medium"
              />
              
              {/* Option Rendering for Select/Checkboxes/MCQ */}
              {(q.type === 'MCQ' || q.type === 'Dropdown' || q.type === 'Checkbox') && (
                <div className="space-y-3 ml-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {q.type === 'MCQ' && <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>}
                      {q.type === 'Checkbox' && <div className="w-4 h-4 rounded border-2 border-gray-400"></div>}
                      {q.type === 'Dropdown' && <span className="text-gray-400 text-sm font-mono">{i + 1}.</span>}
                      <input 
                        type="text" 
                        value={opt}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:outline-none text-gray-800 dark:text-gray-200 py-1"
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[i] = e.target.value;
                          updateQuestion(q.id, { options: newOpts });
                        }}
                      />
                      <button onClick={() => {
                        const newOpts = q.options.filter((_, idx) => idx !== i);
                        updateQuestion(q.id, { options: newOpts });
                      }} className="text-gray-400 hover:text-red-500">−</button>
                    </div>
                  ))}
                  <button 
                    onClick={() => updateQuestion(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                    className="text-sm font-semibold text-primary-600 mt-4 hover:text-primary-700 transition-colors flex items-center gap-1">
                    + Add Option
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <p className="text-gray-500 font-semibold mb-4 text-center">Add Elements</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button onClick={() => addQuestion('Text')} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-dark-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-200">
            <Type className="w-5 h-5 text-blue-500" /> Text
          </button>
          <button onClick={() => addQuestion('MCQ')} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-dark-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 hover:border-indigo-200">
            <List className="w-5 h-5 text-indigo-500" /> Multiple Choice
          </button>
          <button onClick={() => addQuestion('Checkbox')} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-dark-900 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 hover:border-teal-200">
            <CheckSquare className="w-5 h-5 text-teal-500" /> Checkboxes
          </button>
          <button onClick={() => addQuestion('Dropdown')} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-dark-900 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 hover:border-amber-200">
            <ChevronDown className="w-5 h-5 text-amber-500" /> Dropdown
          </button>
          <button onClick={() => addQuestion('Date')} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-dark-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 hover:border-rose-200">
            <Calendar className="w-5 h-5 text-rose-500" /> Date
          </button>
          <button onClick={() => addQuestion('Rating')} className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-dark-900 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 hover:border-yellow-200">
            <Star className="w-5 h-5 text-yellow-500" /> Rating Scale
          </button>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end px-10 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving Survey...' : 'Publish Survey'}
        </button>
      </div>
    </div>
  );
};

export default CreateSurvey;
