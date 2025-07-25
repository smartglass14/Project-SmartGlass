import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CTA = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <section className="px-4 sm:px-6 py-10 flex flex-col gap-8 items-center text-center">
      <h1 className="text-2xl sm:text-3xl font-bold max-w-xl">
        Ready to Transform Your Classroom?
      </h1>
      <p className="text-base text-[#111118] max-w-lg">
        Join thousands of educators using Smartglass to create engaging and interactive learning experiences.
      </p>
      <Link to={isLoggedIn? '/dashboard' : '/login'} className="px-6 py-3 bg-[#2a2aed] text-white text-sm font-bold rounded-xl">
        Get Started
      </Link>
    </section>
  );
};

export default CTA;
