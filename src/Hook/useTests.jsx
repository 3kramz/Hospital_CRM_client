
import { useEffect, useState } from 'react';
import useAxiosSecure from './useAxiosSecure';

const useTests = () => {
  const [testData, setTestData] = useState({});
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from backend
        const { data } = await axiosSecure.get('/tests/test-list');
        
        // Transform flat list to nested structure (Department -> Category -> List)
        // This maintains compatibility with AssignTest.jsx and PatientEntry.jsx
        if (Array.isArray(data)) {
           const structuredData = {};
           data.forEach(test => {
              // Ensure test_id exists (use _id if test_id missing)
              const t = { ...test, test_id: test.test_id || test._id || test.code };
              
              // Normalize keys
              const dept = (t.department || 'General').toLowerCase().replace(/\s+/g, '_');
              const cat = (t.category || 'General').toLowerCase().replace(/\s+/g, '_');

              if (!structuredData[dept]) structuredData[dept] = {};
              if (!structuredData[dept][cat]) structuredData[dept][cat] = [];
              
              structuredData[dept][cat].push(t);
           });
           setTestData(structuredData);
        } else {
           // Fallback if backend returns object or other format
           setTestData(data);
        }
      } catch (error) {
        console.error("Failed to fetch tests from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [axiosSecure]);

  return { testData, loading };
};

export default useTests;
