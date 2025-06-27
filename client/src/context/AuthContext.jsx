import { useState, useEffect, createContext, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const loginContext = (userData, token) => {
    let newUser = { email: userData.email, name: userData.name, id: userData._id, role: userData.role, firebaseUID: userData.firebaseUID };
    setUser(newUser);
    setAuthToken(token);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("authToken", token);
  };

  const logoutContext = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setAuthToken(null);
    setIsLoggedIn(false);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        isLoggedIn,
        loading,
        loginContext,
        logoutContext,
        setUser,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};