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

function Quiz() {
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = sampleQuestions[current];

  const handleSubmit = () => {
    let correct = false;
    if (question.type === "mcq") {
      correct = userAnswer === question.answer;
    } else {
      correct = userAnswer.trim().toLowerCase().includes(question.answer.toLowerCase());
    }
    if (correct) setScore(score + 1);
    setFeedback(correct ? "✅ Great job!" : "❌ Try again.");
    setSubmitted(true);
  };

  const handleNext = () => {
    if (current + 1 >= sampleQuestions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setUserAnswer("");
      setFeedback("");
      setSubmitted(false);
    }
  };

  const restartQuiz = () => {
    setCurrent(0);
    setUserAnswer("");
    setFeedback("");
    setSubmitted(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-xl text-center">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">🎉 Quiz Completed!</h2>
        <p className="text-lg font-medium mb-2">Your Score :</p>
        <p className="text-4xl font-extrabold text-green-600">{score} / {sampleQuestions.length}</p>
        <button
          onClick={restartQuiz}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-xl">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">📝 Quiz Time!</h2>
      <p className="text-lg font-medium mb-4">{question.question}</p>

      {question.type === "mcq" ? (
        <div className="space-y-2 mb-4">
          {question.options.map((option) => (
            <label key={option} className="flex items-center gap-2 bg-purple-50 p-2 rounded hover:bg-purple-100 cursor-pointer">
              <input type="radio" name="option" value={option} checked={userAnswer === option} onChange={() => setUserAnswer(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea
          rows="3"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
          placeholder="Type your answer here..."
        />
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition w-full"
        >
          Submit Answer
        </button>
      ) : (
        <div className="text-center mt-4 space-y-4">
          <p className="text-lg font-semibold">{feedback}</p>
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {current + 1 === sampleQuestions.length ? "See Result" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
