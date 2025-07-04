import { useState } from "react";

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
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = sampleQuestions[current];

  const checkAnswer = () => {
    let correct = false;
    if (q.type === "mcq") {
      correct = userAnswer === q.answer;
    } else {
      correct = userAnswer.toLowerCase().includes(q.answer.toLowerCase());
    }

    if (correct) setScore(score + 1);
    setSubmitted(true);
  };

  const next = () => {
    if (current + 1 === sampleQuestions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setUserAnswer("");
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">📝 Quiz Participation</h2>

        {finished ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">🎉 Quiz Completed!</p>
            <p className="text-2xl font-bold text-green-600">Your Score: {score}/{sampleQuestions.length}</p>
          </div>
        ) : (
          <>
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

            {!submitted ? (
              <button
                onClick={checkAnswer}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            ) : (
              <div className="mt-4">
                <p className="mb-2">
                  {userAnswer.toLowerCase().includes(q.answer.toLowerCase()) ? "✅ Correct!" : "❌ Incorrect."}
                </p>
                <button
                  onClick={next}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {current + 1 === sampleQuestions.length ? "Finish" : "Next"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
