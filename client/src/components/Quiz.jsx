import { useState, useEffect } from "react";

export default function Quiz({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30); // 30 sec per question

  useEffect(() => {
    // Fetch quiz questions from backend
    fetch("/api/quiz/questions")
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(() => {
        setQuestions([
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

        ]);
      });
  }, []);

  useEffect(() => {
    if (timeLeft === 0) handleSubmit();
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    const currentQuestion = questions[current];
    setUserAnswers(prev => [
      ...prev,
      { qid: currentQuestion.id, answer: userAnswer, timeTaken: 30 - timeLeft }
    ]);
    if (current + 1 === questions.length) {
      onComplete(userAnswers.concat({ qid: currentQuestion.id, answer: userAnswer, timeTaken: 30 - timeLeft }));
    } else {
      setCurrent(c => c + 1);
      setUserAnswer("");
      setTimeLeft(30);
    }
  };

  const [userAnswer, setUserAnswer] = useState("");

  if (!questions.length) return <p>Loading questions...</p>;

  const q = questions[current];

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Question {current + 1}</h2>
        <p className="text-red-600 font-semibold">⏱️ {timeLeft}s</p>
      </div>
      <p className="mb-3">{q.question}</p>

      {q.type === "mcq" ? (
        <div className="space-y-2 mb-4">
          {q.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="option"
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
          className="border p-2 rounded w-full mb-4"
        />
      )}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}



