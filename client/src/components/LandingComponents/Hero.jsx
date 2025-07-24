import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Hero = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="@container px-4 sm:px-6">
      <div
        className="flex min-h-[480px] flex-col gap-6 items-center justify-center rounded-xl bg-cover bg-center bg-no-repeat text-center text-white p-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpBpy1YFccaMTwFtxkbboesRSVxzPUcXfpZX2Cc9RHT9lBxegVyF0-zegVv9r-k_AKUp4PG3ypiahSvO8eoi6S2FLk8NTn2Kz35oNWC48C6K1fSIgFY3qITdebC3yzxlKI3FJCK6iBKwk_49RqFDEU57Sz9lrBtwuM71nRqGLeJ8aKtOQ7HJMMkeJkgn4n12kdH5OksTc--mNadyb8pYSbXNybWEtpAkmHbb7LAIlT2zK34wSuLHC-iOxCxNXTma3KcNgQBWJn3k7l')",
        }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight max-w-2xl">
          Engage Your Students with Interactive Presentations
        </h1>
        <p className="text-sm sm:text-base max-w-xl">
          Create dynamic presentations with real-time polls, quizzes, and more to boost student engagement.
        </p>
        <Link to={isLoggedIn? '/dashboard' : '/login'} className="px-6 py-3 bg-[#2a2aed] text-white text-sm font-bold rounded-xl">
        Get Started
        </Link>
      </div>
    </div>
  );
};

export default Hero;
