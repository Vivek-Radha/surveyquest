const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className="space-y-6 mt-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse flex flex-col gap-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 dark:bg-dark-700/50 rounded w-1/4 mb-4"></div>
          <div className="flex gap-4 mt-auto border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="h-10 bg-gray-100 dark:bg-dark-700 rounded-lg w-1/2"></div>
            <div className="h-10 bg-gray-100 dark:bg-dark-700 rounded-lg w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
