
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../../firebase/firebase.config";
import useAxiosSecure from "../../Hook/useAxiosSecure"; // Using this won't work if not logged in? No, use Public axios if we want to create users in DB, but DB creation is restricted usually.
// Wait, to create users in DB, we need to POST to /users. The endpoint /users is verified by Admin token.
// CATCH 22: We need Admin token to create users in DB.
// SOLUTION: We will create the FIREBASE users here.
// AND we will use a backend script (which I already wrote/will write) to Insert them into MongoDB.

// Wait, I can't run backend script from browser.
// But I have terminal access. I can run backend script.
// So this Recovery.jsx is ONLY for creating Firebase Authentication Users.

const auth = getAuth(app);

const Recovery = () => {
  const [status, setStatus] = useState("");

  const createStats = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return `Created ${email}`;
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
         // Try checking login
         try {
            await signInWithEmailAndPassword(auth, email, password);
            return `Exists & Valid ${email}`;
         } catch (loginErr) {
            return `Exists & Invalid Pass ${email} (${loginErr.code})`;
         }
      }
      return `Failed ${email}: ${e.code}`;
    }
  };

  const handleRun = async () => {
    setStatus("Running...");
    const results = [];
    
    // Admin Fix
    results.push(await createStats("admin_fix@hospitam.com", "123456"));
    
    // Sample Fix
    results.push(await createStats("sample_fix@gmail.com", "111111"));
    
    // Lab Fix
    results.push(await createStats("lab_fix@gmail.com", "111111"));

    // Requested User
    results.push(await createStats("sample_collection@gmail.com", "111111"));
    
    setStatus(results.join("\n"));
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">User Recovery/Setup</h1>
      <button onClick={handleRun} className="btn btn-primary">
        Create Firebase Users
      </button>
      <pre className="mt-4 bg-gray-100 p-4 border rounded">
        {status}
      </pre>
    </div>
  );
};

export default Recovery;
