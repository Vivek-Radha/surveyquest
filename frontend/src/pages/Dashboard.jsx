import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BarChart2, Share2, ArrowRight, Lock, Globe, ServerCog } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [communitySurveys, setCommunitySurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const [mySurveys, commSurveys] = await Promise.all([
          api.getMySurveys(),
          api.getCommunitySurveys()
        ]);
        setSurveys(mySurveys);
        setCommunitySurveys(commSurveys);
      } catch (error) {
        toast.error("Failed to fetch dashboard data: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 6) return toast.error('Code must be exactly 6 characters');
    const loadId = toast.loading('Authenticating Code...');
    try {
      const survey = await api.joinSurveyByCode(joinCode);
      toast.success('Access Granted!', { id: loadId });
      navigate(`/survey/${survey.shareLink}`);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code', { id: loadId });
    }
  };

  if (loading) return (
    <div className="space-y-8">
      <SkeletonLoader count={3} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 mt-4 px-4 w-full overflow-x-hidden">

      {/* ----------------- TOP ACTION HERO ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

        {/* Action 1: Create Space */}
        <div className="bg-indigo-600 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden h-full">
          <div className="relative z-10 w-full">
            <h2 className="text-3xl font-extrabold mb-3 text-white">Publish your Survey</h2>
            <p className="text-indigo-100 text-sm md:text-base mb-8 max-w-sm">Deploy data collection mechanics rapidly and gather intelligence across the global network.</p>
          </div>
          {/* Decorative Chart Icon */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
            <BarChart2 className="w-48 h-48" />
          </div>

          <Link to="/create-survey" className="relative z-10 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full sm:w-max px-10 py-4 flex items-center justify-center gap-2 bg-white text-indigo-600 rounded-xl font-bold shadow-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 font-bold" /> Compile New Survey
            </motion.button>
          </Link>
        </div>

        {/* Action 2: Join Space */}
        <div className="bg-white dark:bg-dark-800 p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Access Survey</h3>
            <p className="text-gray-500 text-sm md:text-base mb-8 max-w-sm">Have a private 6-digit access code? Enter it below to securely tunnel into private research environments.</p>
          </div>
          {/* Decorative Lock Icon */}
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none -translate-y-4">
            <Lock className="w-56 h-56" />
          </div>

          <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row gap-3 relative z-10">
            <input
              type="text"
              placeholder="EX: X9T2L1"
              className="flex-1 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-lg tracking-[0.25em] uppercase font-bold text-gray-800 dark:text-gray-100 shadow-inner"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white rounded-xl px-10 py-4 font-bold transition-all shadow-md shadow-gray-200 dark:shadow-none min-w-[max-content]">
              Connect
            </button>
          </form>
        </div>

      </div>

      {/* ----------------- DASHBOARD SECTIONS (SIDE BY SIDE) ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* ----------------- COMMUNITY FEED (LEFT) ----------------- */}
        <div className="space-y-6 bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 w-full flex flex-col">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">Community Surveys</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 content-start">
            {communitySurveys.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-500 italic flex flex-col items-center justify-center">
                <ServerCog className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
                No public surveys broadcasted onto the network right now.
              </div>
            ) : (
              communitySurveys.map((survey, i) => (
                <motion.div
                  key={`comm-${survey._id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-50 dark:bg-dark-900/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md transition-all flex flex-col h-full"
                >
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold mb-3 uppercase tracking-widest bg-blue-100/50 dark:bg-blue-900/30 w-max px-2.5 py-1 rounded-md border border-blue-200/50">
                    {survey.creator?.name || 'Anonymous User'}
                  </p>
                  <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-gray-100 leading-tight w-full break-words">{survey.title}</h3>

                  <div className="mt-auto pt-6">
                    <Link to={`/survey/${survey.shareLink}`}>
                      <button className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 dark:hover:border-blue-800 transition-all py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group">
                        Participate
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ----------------- MY AUTHORIZED SURVEYS (RIGHT) ----------------- */}
        <div className="space-y-6 bg-white dark:bg-dark-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 w-full flex flex-col">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">My Surveys</h3>
            </div>
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold px-3 py-1 rounded-full text-xs shadow-sm whitespace-nowrap">
              {surveys.length} Running Data Matrices
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 content-start">
            {surveys.length === 0 ? (
              <p className="col-span-full py-8 text-sm text-gray-500 italic max-w-sm">No active surveys published yet. Head to the Publisher Engine above to begin data collection.</p>
            ) : (
              surveys.map((survey) => (
                <div key={`my-${survey._id}`} className="flex flex-col h-full bg-gray-50 dark:bg-dark-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors shadow-sm relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-4 relative z-10 w-full min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-2 w-[70%]">{survey.title}</h4>
                    {survey.isPublic ? (
                      <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase whitespace-nowrap h-min">Public</span>
                    ) : (
                      <span className="bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase whitespace-nowrap flex items-center h-min"><Lock className="w-2.5 h-2.5 mr-0.5" />{survey.joinCode}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto pt-6 relative z-10">
                    <Link to={`/edit-survey`} state={{ survey }} className="col-span-1 flex items-center justify-center bg-white dark:bg-dark-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 transition-colors py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300">
                      Edit Format
                    </Link>
                    <button
                      onClick={() => {
                        const route = survey.isPublic ? `${window.location.origin}/survey/${survey.shareLink}` : survey.joinCode;
                        navigator.clipboard.writeText(route);
                        toast.success(survey.isPublic ? "Public Link Copied!" : "Private Pin Copied!");
                      }}
                      className="col-span-1 bg-white dark:bg-dark-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 transition-colors py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 flex justify-center items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                    <Link to={`/results`} state={{ survey }} className="col-span-2 flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 dark:hover:bg-indigo-900/80 transition-colors py-2.5 rounded-xl text-xs font-bold shadow-sm">
                      <BarChart2 className="w-4 h-4 mr-1.5" /> Launch Results Dashboard
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
