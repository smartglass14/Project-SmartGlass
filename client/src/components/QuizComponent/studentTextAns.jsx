export default function StudentTextAns({ value, onChange, disabled = false }) {

  const wordCount = value.length;
  const overLimit = wordCount > 200;

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <>
      <textarea
        className="w-full border rounded-lg p-2 text-base resize-vertical sm:min-h-[100px] max-h-[200px] min-h-[200px]"
        placeholder="Type your answer (max 200 words)"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={2000} 
      />
      <div className="flex justify-between items-center text-sm">
        <span className={overLimit ? 'text-red-500' : 'text-gray-500'}>
          {wordCount} / 200 words
        </span>
      </div>
    </>
  );
}