import { createContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
// Firebase Configuration Import
import { app } from "../../firebase/firebase.config"; 
import { axiosPublic } from "../Hook/useAxios";

export const AuthContext = createContext(null);

const auth = getAuth(app);
const TOKEN_REFRESH_MS = 50 * 60 * 1000; // refresh before 1h JWT expiry

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        setLoading(false);
        throw error;
      });
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth)
      .catch((error) => {
        setLoading(false);
        throw error;
      });
  };

  const forgetPassword = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email)
      .catch((error) => {
        setLoading(false);
        throw error;
      });
  };

  const refreshBackendToken = async (currentUser) => {
    if (!currentUser?.email) return;

    const userInfo = { email: currentUser.email };
    const res = await axiosPublic.post("/jwt", userInfo);
    if (res.data?.token) {
      localStorage.setItem("access-token", res.data.token);
      return;
    }
    throw new Error("Backend did not return token");
  };

  useEffect(() => {
    let refreshInterval;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        refreshBackendToken(currentUser)
          .then(() => {
            setLoading(false);
            clearInterval(refreshInterval);
            refreshInterval = setInterval(() => {
              refreshBackendToken(currentUser).catch((error) => {
                console.error("JWT refresh failed", error);
                localStorage.removeItem("access-token");
              });
            }, TOKEN_REFRESH_MS);
          })
          .catch((error) => {
            console.error("JWT token fetch failed", error);
            // FIX 2: If backend fails, remove token and log out to prevent 
            // the user from being stuck in a broken "logged in" state.
            localStorage.removeItem("access-token");
            signOut(auth); 
            setLoading(false);
          });
      } else {
        // User logged out
        clearInterval(refreshInterval);
        localStorage.removeItem("access-token");
        setLoading(false);
      }
    });

    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []);

  const AuthInfo = {
    user,
    loading,
    signIn,
    logOut,
    forgetPassword,
  };

  return (
    <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;