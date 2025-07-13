import { useEffect, useState } from 'react';

const useTests = () => {
  const [testData, setTestData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/tests.json'); 
      const data = await res.json();
      setTestData(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  return { testData, loading };
};

export default useTests;
