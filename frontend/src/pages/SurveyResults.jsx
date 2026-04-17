import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Trash2, ArrowLeft, BarChart2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const SurveyResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const survey = location.state?.survey;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pulseLine, setPulseLine] = useState(false);

  useEffect(() => {
    if (!survey) {
      toast.error('Survey parameters missing');
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const responses = await api.getSurveyResponses(survey._id);
        setLogs(responses);
      } catch (error) {
        toast.error("Network Error: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Specific room/channel Socket.io integration can go here
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');
    const socket = io(socketUrl);
    socket.on('newResponse', (data) => {
      if (data.surveyId === survey._id && data.response) {
        setLogs(prev => [data.response, ...prev]);
        setPulseLine(true);
        setTimeout(() => setPulseLine(false), 2000);
      }
    });

    return () => socket.disconnect();
  }, [survey, navigate]);

  const handleDeleteResponse = async (id) => {
    try {
      await api.deleteResponse(id);
      setLogs(logs.filter(l => l._id !== id));
      toast.success('Response permanently purged!');
    } catch(err) {
      toast.error(err.message || 'Failed to delete response');
    }
  };

  if (!survey) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      
      <div className="flex items-center gap-4 mb-2">
        <Link to="/dashboard">
           <button className="p-2 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
           </button>
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white truncate">
          {survey.title} Results
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Participants</p>
            <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{loading ? '-' : logs.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
             <BarChart2 className="w-10 h-10 text-indigo-500" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between transition-all duration-500 ${pulseLine ? 'ring-4 ring-emerald-500/50 scale-[1.02]' : ''}`}
        >
          <div>
             <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Live Status</p>
             <p className="text-green-600 dark:text-green-400 font-bold mt-2 text-xl flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
               Actively Listening...
             </p>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
             <Activity className={`w-10 h-10 ${pulseLine ? 'text-emerald-500' : 'text-gray-400'}`} />
          </div>
        </motion.div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Respondent Data Matrix</h3>
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-dark-900 text-xs uppercase font-bold text-gray-700 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Submission Time</th>
                  <th className="px-6 py-4">Answers Array</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-8">Loading logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500">No participants have responded to this survey yet.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {log.respondent ? log.respondent.name : 'Anonymous User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-lg overflow-hidden text-ellipsis whitespace-nowrap">
                       {log.answers && log.answers.length > 0 ? (
                           <div className="flex flex-col gap-1">
                              {log.answers.map((a, idx) => (
                                <span key={idx} className="bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded text-xs truncate">
                                   Q{idx+1}: {a.answerText || a.ratingValue}
                                </span>
                              ))}
                           </div>
                       ) : (
                           <span className="italic text-gray-400">Empty Submission</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDeleteResponse(log._id)} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800 shadow-sm">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SurveyResults;
