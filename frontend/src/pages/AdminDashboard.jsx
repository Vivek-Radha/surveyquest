import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, surveys: 0, responses: 0 });
  const [logs, setLogs] = useState([]);
  const [pulseLine, setPulseLine] = useState(false);

  const velocityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const velocity = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        velocity.push({ name: days[d.getDay()], responses: 0, date: d.toDateString() });
    }
    logs.forEach(log => {
      const d = new Date(log.createdAt);
      const v = velocity.find(item => item.date === d.toDateString());
      if (v) {
        v.responses++;
      }
    });
    return velocity;
  }, [logs]);

  const demographicData = useMemo(() => {
    const surveyCounts = {};
    logs.forEach(log => {
      const surveyName = log.survey ? log.survey.title : 'Deleted Survey';
      if (!surveyCounts[surveyName]) surveyCounts[surveyName] = 0;
      surveyCounts[surveyName]++;
    });
    return Object.keys(surveyCounts).map(key => ({
      name: key.length > 15 ? key.substring(0, 15) + '...' : key,
      responses: surveyCounts[key]
    })).sort((a, b) => b.responses - a.responses).slice(0, 7);
  }, [logs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getStats();
        setStats({ users: data.totalUsers, surveys: data.totalSurveys, responses: data.totalResponses });
        const recentLogs = await api.getAllResponses();
        setLogs(recentLogs);
      } catch (error) {
        console.error("Failed fetching admin stats", error);
      }
    };
    fetchData();

    // Socket.io integration
    const socket = io('http://localhost:5000');
    socket.on('newResponse', (data) => {
      setStats(prev => ({ ...prev, responses: prev.responses + 1 }));
      if (data.response) {
        setLogs(prev => [data.response, ...prev].slice(0, 100)); // Prepend and keep 100
      }
      setPulseLine(true);
      setTimeout(() => setPulseLine(false), 2000);
    });
    
    return () => socket.disconnect();
  }, []);

  const handleDeleteResponse = async (id) => {
    try {
      await api.deleteResponse(id);
      setLogs(logs.filter(l => l._id !== id));
      toast.success('Response permanently purged!');
    } catch(err) {
      toast.error(err.message || 'Failed to delete response');
    }
  };

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 transition-all duration-500 ${pulseLine && colorClass.includes('emerald') ? 'ring-4 ring-emerald-500/50 scale-[1.02]' : ''}`}
    >
      <div className={`p-5 rounded-2xl ${colorClass} flex-shrink-0`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Admin Overview</h1>
          <p className="text-green-600 dark:text-green-400 font-medium mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            Live connection established
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Users" value={stats.users} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
        <StatCard icon={FileText} label="Active Surveys" value={stats.surveys} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" />
        <StatCard icon={Activity} label="Total Responses" value={stats.responses} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-[450px]">
          <h3 className="font-bold text-xl mb-8 text-gray-900 dark:text-white">Response Velocity</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#111827', fontWeight: 'bold' }}
                itemStyle={{ color: '#2563eb' }}
              />
              <Line type="monotone" dataKey="responses" stroke="#2563eb" strokeWidth={4} dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2, r: 6 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#1d4ed8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-[450px]">
          <h3 className="font-bold text-xl mb-8 text-gray-900 dark:text-white">Demographic Spread</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={demographicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#1f2937', fontWeight: 'bold' }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="responses" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Live Database Logs</h3>
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Auto-syncing
          </span>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-[#f8fafc] dark:bg-dark-900/80 text-xs uppercase font-extrabold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 tracking-wider">
                <tr>
                  <th className="px-6 py-5">Respondent</th>
                  <th className="px-6 py-5">Survey Target</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5">Response Data</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-500">No responses logged yet in the database.</td></tr>
                ) : logs.map((log) => {
                  
                  // Extract username logic from first answer
                  let respondentName = 'Anonymous';
                  let isGuest = false;
                  if (log.respondent && log.respondent.name) {
                    respondentName = log.respondent.name;
                  } else if (log.answers && log.answers.length > 0 && log.answers[0].answerText) {
                    const possibleName = log.answers[0].answerText.trim();
                    // Basic sanity check to ensure it's not a block of text
                    if (possibleName.length > 1 && possibleName.length < 25) {
                      respondentName = possibleName;
                      isGuest = true;
                    }
                  }
                  
                  const initials = respondentName === 'Anonymous' ? '?' : respondentName.substring(0, 2).toUpperCase();

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-all duration-200 group bg-white dark:bg-dark-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0
                            ${respondentName === 'Anonymous' 
                               ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' 
                               : 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 dark:from-indigo-900/40 dark:to-blue-900/40 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800'}
                          `}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                              {respondentName}
                              {isGuest && <span className="text-[9px] uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800/50">Guest</span>}
                            </p>
                            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 font-mono">ID: {log._id.substring(log._id.length - 6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 max-w-[200px] truncate">
                          {log.survey ? log.survey.title : 'Deleted Survey'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {log.answers && log.answers.length > 0 ? log.answers.slice(isGuest ? 1 : 0, isGuest ? 3 : 2).map((a, i) => (
                            <div key={i} className="max-w-[140px] inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-dark-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700 truncate shadow-sm">
                              <span className="truncate">{a.answerText || 'N/A'}</span>
                            </div>
                          )) : <span className="text-gray-400 italic text-xs">No content provided</span>}
                          
                          {log.answers && log.answers.length > (isGuest ? 3 : 2) && (
                            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-50 text-gray-500 dark:bg-dark-800 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
                              +{log.answers.length - (isGuest ? 3 : 2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleDeleteResponse(log._id)} 
                           className="text-gray-400 hover:text-red-500 bg-white dark:bg-dark-800 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-800 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                           title="Permanently Delete Response"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
