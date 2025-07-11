import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SessionCodePopup from "../components/SessionCodePopup";
import { useState } from "react";
import { Flag } from "lucide-react";

export default function Dashboard() {

  const { user } = useAuth();
  const [shadowPopup, setShowPopup] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-pink-100">
        <div className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 max-w-md">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Please log in
          </h2>
          <p className="text-gray-600 mt-2">You need to log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const SectionCard = ({ title, description, icon, href , onClick=null}) => (
    <div className="p-6 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all" onClick={onClick}>
      <Link to={href} >
        <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2 mb-2">
          {icon} {title}
        </h2>
        <p className="text-gray-700 text-sm">{description}</p>
      </Link>
    </div>
  );

  return (

  <>  
    {shadowPopup && <SessionCodePopup onClose={()=> setShowPopup(false)} role={user?.role} /> }
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-2xl p-10">
          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-10">
            {user.role === "Educator" ? "🎓 Educator Dashboard" : "📚 Student Dashboard"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user.role === "Educator" ? (
              <>
                <SectionCard
                  title="Create Poll"
                  icon="👩‍🎓"
                  description="Manage and organize your learning sessions."
                  href={'/create/poll'}
                />
                <SectionCard
                  title="Create Quizzes"
                  icon="📝"
                  description="Design quizzes for students and evaluate results."
                  href={'/create/quiz'}
                />
                <SectionCard
                  title="Session Analytics"
                  icon="⏱"
                  description="Insights on student activity and sessions."
                  onClick={()=> setShowPopup(true)}
                />
                <SectionCard
                  title="History"
                  icon="📜"
                  description="Review past session details."
                />
              </>
            ) : (
              <>
                <SectionCard
                  title="Join Sessions"
                  icon="🧠"
                  description="Participate in educator-hosted live sessions."
                  onClick={()=> setShowPopup(true)}
                />

                 <SectionCard
                  title="Uploaded Documents"
                  icon="📄"
                  description="Access and manage your uploaded files securely."
                  href={'/upload'}
                />
                <SectionCard
                  title="AI Chat Assistant"
                  icon="🤖"
                  description="Ask questions and get instant AI support."
                  href={"/chat"}
                />
                <SectionCard
                  title="My Progress"
                  icon="📊"
                  description="View your quiz scores, session attendance, and learning growth over time."
                />
                <SectionCard
                  title="Learning Resources"
                  icon="📚"
                  description="Explore curated tutorials, notes, and extra material shared by educators."
                />
                
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
