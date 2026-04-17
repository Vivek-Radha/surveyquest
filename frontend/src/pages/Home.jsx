import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Users, Zap } from 'lucide-react';
import MinimalImage from '../assets/dashboard_minimal.svg';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
  >
    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-dark-700 flex items-center justify-center mb-6 text-primary-600">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-10 pb-20">
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl w-full mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-left"
        >

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900 dark:text-white tracking-tight leading-tight">
            Surveys from the <span className="text-primary-600">Future</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
            Create, distribute, and analyze surveys in real-time and seamless user experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-900 p-1">
            <img src={MinimalImage} alt="Dashboard Illustration" className="w-full object-cover rounded-[12px] border border-gray-100 dark:border-gray-800/50" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <FeatureCard
          icon={Zap}
          title="Real-Time Analytics"
          description="Watch your results update instantly with our WebSocket powered dashboards."
          delay={0.2}
        />
        <FeatureCard
          icon={Users}
          title="Audience Insights"
          description="Discover powerful metrics about your respondents with built in demographic trackers."
          delay={0.4}
        />
        <FeatureCard
          icon={Database}
          title="Secure Database"
          description="Your data is safely stored and encrypted using industry standard MongoDB and bcrypt."
          delay={0.6}
        />
      </div>
    </div>
  );
};

export default Home;
