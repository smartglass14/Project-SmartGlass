import { useState, useEffect, createContext, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guestUser, setGuestUser] = useState(null);
  const [authToken, setAuthToken] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");
    const storedGuest = JSON.parse(localStorage.getItem("guest"));

    if(storedGuest && storedGuest !== undefined){
      setGuestUser(storedGuest);
    }

    if ((storedUser && storedToken) && (storedUser!=undefined && storedToken!==undefined)) {
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const loginContext = (userData, token) => {
    let newUser = { email: userData.email, name: userData.name, id: userData._id, role: userData.role || null , firebaseUID: userData.firebaseUID };
    setUser(newUser);
    setAuthToken(token);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("authToken", token);
  };

  const provideGuestAuth = (data)=> {
    localStorage.setItem('guest', JSON.stringify(data));
    localStorage.setItem('isServiceUsed', false);
    setGuestUser(data);
  }

  const cleanUpGuest = ()=> {
    setGuestUser(null);
    localStorage.removeItem('guest');
    localStorage.removeItem('isServiceUsed');
  }

  const logOutUser = () => {
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
        guestUser,
        authToken,
        isLoggedIn,
        loading,
        loginContext,
        logOutUser,
        provideGuestAuth,
        cleanUpGuest,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};