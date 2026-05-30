import { createContext, useCallback, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { app } from "../../firebase/firebase.config";
import { axiosPublic } from "../Hook/useAxios";

export const AuthContext = createContext(null);

const auth = getAuth(app);
const TOKEN_REFRESH_MS = 50 * 60 * 1000; // refresh before 1-hour JWT expiry

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // user profile from backend
  const [loading, setLoading] = useState(true);

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password).catch((error) => {
      setLoading(false);
      throw error;
    });
  };

  // Stable reference — prevents useAxiosSecure from re-registering interceptors
  // on every auth state change.
  const logOut = useCallback(() => {
    setLoading(true);
    return signOut(auth).catch((error) => {
      setLoading(false);
      throw error;
    });
  }, []);

  const forgetPassword = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email).catch((error) => {
      setLoading(false);
      throw error;
    });
  };

  // Fetches backend JWT.  The server now also returns the user profile in the
  // same response, eliminating the separate GET /users/user/:email round-trip.
  const refreshBackendToken = async (currentUser) => {
    if (!currentUser?.email) return;

    const res = await axiosPublic.post("/jwt", { email: currentUser.email });
    if (res.data?.token) {
      localStorage.setItem("access-token", res.data.token);
      // Cache the user profile so useUserData doesn't need another fetch
      if (res.data?.user) {
        setUserData(res.data.user);
      }
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
            localStorage.removeItem("access-token");
            setUserData(null);
            signOut(auth);
            setLoading(false);
          });
      } else {
        clearInterval(refreshInterval);
        localStorage.removeItem("access-token");
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const AuthInfo = {
    user,
    userData,   // ← exposed so useUserData can skip the extra API call
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