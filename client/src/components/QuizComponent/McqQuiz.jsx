export default function McqQuiz({ question, qIdx, updateOptionText, setEditing, finishEditing, markAsCorrect }) {
  return (
    <>
      <div className="space-y-2">
        {question.options.map((opt, optIdx) => (
          <div
            key={optIdx}
            onClick={() => markAsCorrect(qIdx, optIdx)}
            className={`rounded-lg px-4 py-2 border transition cursor-pointer ${
              question.correctOption === optIdx
                ? "bg-green-100 border-green-500"
                : "bg-gray-100 border-gray-300 hover:border-gray-400"
            }`}
          >
            {question.editingOption === optIdx ? (
              <input
                type="text"
                value={opt}
                onChange={e => updateOptionText(qIdx, optIdx, e.target.value)}
                onBlur={() => finishEditing(qIdx)}
                autoFocus
                className="w-full bg-transparent outline-none"
              />
            ) : (
              <div
                onClick={e => {
                  e.stopPropagation();
                  setEditing(qIdx, optIdx);
                }}
                className="flex justify-between items-center"
              >
                <span>{opt || `Option ${optIdx + 1}`}</span>
                {question.correctOption === optIdx && (
                  <span className="text-green-600 font-bold">✅</span>
                )}
              </div>
            )}
          </div>
        ))}
        <span className="text-xs font-bold">Double click on any option to select it as correct option for given Question</span>
      </div>
    </>
  );
}