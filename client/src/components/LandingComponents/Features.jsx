import { Presentation, PieChart, HelpCircle, MessageSquare } from "lucide-react";

const features = [
  {
    icon: <Presentation size={24} />,
    title: "Interactive Presentations",
    desc: "Create dynamic presentations with polls, quizzes, and word clouds.",
  },
  {
    icon: <PieChart size={24} />,
    title: "Real-time Polls",
    desc: "Gather instant feedback from your students.",
  },
  {
    icon: <HelpCircle size={24} />,
    title: "Engaging Quizzes",
    desc: "Make learning fun with interactive quizzes.",
  },
  {
    icon: <MessageSquare size={24} />,
    title: "Live Q&A",
    desc: "Facilitate live sessions to answer student questions.",
  },
];

const Features = () => {
  return (
    <section className="flex flex-col gap-10 px-4 sm:px-6 py-10">
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Key Features</h1>
        <p className="text-base text-[#111118] max-w-xl mx-auto sm:mx-0">
          Smartglass offers a range of interactive tools to enhance your presentations.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item, index) => (
          <div key={index} className="p-4 border border-[#dbdbe6] rounded-lg bg-white flex flex-col gap-3">
            <div className="text-[#111118]">{item.icon}</div>
            <h2 className="text-base font-bold">{item.title}</h2>
            <p className="text-sm text-[#616189]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
