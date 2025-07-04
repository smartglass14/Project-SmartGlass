import { useState, useEffect } from "react";
import QuizResult from "../components/QuizResult";

const sampleQuestions = [
  { id: 1, question: "Which planet is known as the Red Planet?", type: "mcq", options: ["Earth", "Venus", "Mars", "Jupiter"], answer: "Mars" },
  { id: 2, question: "What is the national bird of India?", type: "mcq", options: ["Parrot", "Peacock", "Sparrow", "Eagle"], answer: "Peacock" },
  { id: 3, question: "In which direction does the sun rise?", type: "mcq", options: ["North", "South", "East", "West"], answer: "East" },
  { id: 4, question: "How many continents are there on Earth?", type: "mcq", options: ["5", "6", "7", "8"], answer: "7" },
  { id: 5, question: "Who wrote the Indian national anthem?", type: "mcq", options: ["Bankim Chandra Chatterjee", "Sarojini Naidu", "Rabindranath Tagore", "Mahatma Gandhi"], answer: "Rabindranath Tagore" },
  { id: 6, question: "What is the process by which plants make their food?", type: "mcq", options: ["Respiration", "Transpiration", "Photosynthesis", "Digestion"], answer: "Photosynthesis" },
  { id: 7, question: "Describe the water cycle briefly.", type: "text", answer: "The water cycle involves evaporation, condensation, and precipitation." },
  { id: 8, question: "Who is known as the 'Father of the Nation' in India?", type: "mcq", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "Dr. B.R. Ambedkar"], answer: "Mahatma Gandhi" },
  { id: 9, question: "Name one device used to measure temperature.", type: "text", answer: "Thermometer" },
  { id: 10, question: "What is the capital of India?", type: "mcq", options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], answer: "New Delhi" },
  { id: 11, question: "Which gas do plants absorb from the atmosphere?", type: "mcq", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide" },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);

  const q = sampleQuestions[current];

  // Load saved answer when navigating
  useEffect(() => {
    const saved = userAnswers[current];
    setUserAnswer(saved?.answerGiven === "Skipped" ? "" : saved?.answerGiven || "");
    setTimeLeft(30 - (saved?.timeTaken || 0));
    setStartTime(Date.now());
  }, [current]);

  //Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 0) {
          handleSave("Skipped");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSave = (customAnswer = null) => {
    const endTime = Date.now();
    const timeTaken = Math.min(30, Math.round((endTime - startTime) / 1000));

    const updated = [...userAnswers];
    updated[current] = {
      ...q,
      answerGiven: customAnswer !== null && customAnswer !== undefined ? customAnswer : (userAnswer || "Skipped"),
      timeTaken,
    };
    setUserAnswers(updated);
  };
    const handleNext = () => {
      handleSave();
      if (current + 1 === sampleQuestions.length) {
        setFinished(true);
      } else {
        setCurrent(current + 1);
      }
    };

    const handlePrev = () => {
      handleSave();
      if (current > 0) setCurrent(current - 1);
    };

    const handleSkip = () => {
      setUserAnswer("");
      handleSave("Skipped");
      if (current + 1 === sampleQuestions.length) {
        setFinished(true);
      } else {
        setCurrent(current + 1);
      }
    };

    if (finished) return <QuizResult data={userAnswers} questions={sampleQuestions} />;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">📝 Quiz Participation</h2>
          <div className="flex justify-between mb-2">
            <p className="text-gray-600 font-medium">Question {current + 1} of {sampleQuestions.length}</p>
            <p className="text-red-600 font-semibold">⏱️ {timeLeft}s</p>
          </div>

          <p className="font-medium mb-3">{q.question}</p>

          {q.type === "mcq" ? (
            <div className="space-y-2 mb-4">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="opt"
                    value={opt}
                    checked={userAnswer === opt}
                    onChange={() => setUserAnswer(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer"
              className="p-2 border rounded w-full mb-4"
            />
          )}

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handlePrev}
              className="px-3 py-2 text-white rounded-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
              disabled={current === 0}
            >
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="px-3 py-2 text-white rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-400 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="px-3 py-2 text-white rounded-xl font-semibold bg-gradient-to-r from-green-400 to-green-400 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              {current + 1 === sampleQuestions.length ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }
