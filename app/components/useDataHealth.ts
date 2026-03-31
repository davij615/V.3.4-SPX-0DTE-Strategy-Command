import { useEffect, useState } from 'react';

const useDataHealth = () => {
  const [dataQuality, setDataQuality] = useState(null);
  const [streamHealth, setStreamHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDataHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/strategy-data');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDataQuality(data.dataQuality);
      setStreamHealth(data.streamHealth);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataHealth(); // initial fetch
    const interval = setInterval(() => {
      fetchDataHealth(); // auto-refresh every 60 seconds
    }, 60000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return { dataQuality, streamHealth, loading, error };
};

export default useDataHealth;
