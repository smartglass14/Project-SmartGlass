import { useEffect } from "react";
import RolePopup from "../../components/RolePopup";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {API, handleApi} from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Hero from '../../components/LandingComponents/Hero'
import CTA from '../../components/LandingComponents/CTA'
import Features from '../../components/LandingComponents/Features'
import GuestMode from "../../components/LandingComponents/GuestMode";

export default function LandingPage () {

  const auth = useAuth();
  const navigate = useNavigate();
  const [showRolePopup, setShowRolePopup] = useState(false);

  useEffect(()=> {
    if(auth.guestUser !==null){
      let isUsed = localStorage.getItem('isServiceUsed')
      if(isUsed == 'true'){
        auth.cleanUpGuest();
      }
    }

    if (auth.user && !auth.user.role) {
      setShowRolePopup(true);
    }
  },[auth, navigate])

  const saveRole = async (role) => {
    if (!role) return;
    try {
      let res = await handleApi(API.put("/auth/role", { role }, {
        headers: {
          "Authorization": `Bearer ${auth.authToken}`,
        },
        withCredentials: true }));

        if (res.status === 200) {
          auth.loginContext( res.data.user, res.data.token);
          setShowRolePopup(false);
          toast.success(res.data.message);
          navigate('/dashboard');
       }

      if(res.error){
        toast.error(res.error.message || "Failed to save role. Please try again.");
      }

    } catch (error) {
      console.error("Error saving role:", error);
    }
  };


  return (
    <>
    {showRolePopup && <RolePopup onConfirm={saveRole} onClose={()=> setShowRolePopup(false)}/> }

    <div
      className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
      style={{ fontFamily: 'Lexend, Noto Sans, sans-serif' }}
    >
      <div className="layout-container flex flex-col h-full grow">
        <main className="px-4 md:px-10 lg:px-20 xl:px-40 py-5 flex flex-1 justify-center">
          <div className="max-w-[960px] flex-1 flex flex-col gap-3">
            {!auth?.isLoggedIn && !auth?.user &&  <GuestMode /> }
            <Hero />
            <Features />
            <CTA />
          </div>
        </main>
      </div>
    </div>
    </>
  );
};
