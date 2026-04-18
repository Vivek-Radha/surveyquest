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
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Live Database Logs</h3>
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-dark-900 text-xs uppercase font-bold text-gray-700 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Respondent</th>
                  <th className="px-6 py-4">Survey Target</th>
                  <th className="px-6 py-4">Timestamps</th>
                  <th className="px-6 py-4">Response Preview</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No responses logged yet</td></tr>
                ) : logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {log.respondent ? log.respondent.name : 'Anonymous'}
                    </td>
                    <td className="px-6 py-4">
                      {log.survey ? log.survey.title : 'Deleted Survey'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-md overflow-hidden text-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-300">
                       {log.answers && log.answers.length > 0 
                         ? log.answers.map(a => a.answerText).join('  •  ')
                         : 'No content'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => handleDeleteResponse(log._id)} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800">
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

export default AdminDashboard;
