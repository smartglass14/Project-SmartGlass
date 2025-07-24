import { X } from 'lucide-react';
import { useState } from 'react';

export default function TextAnsPopUp({ answers = [], onClose }) {
  const [search, setSearch] = useState('');

  const filteredAnswers = answers.filter(ans =>
    ans.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 bg-slate-400/40 z-40" onClick={onClose}></div>
      {/* Popup for mobile */}
      <div
        className="fixed bottom-0 left-0 w-full z-50 sm:hidden"
        style={{ height: '60vh'}}
      >
        <div className="bg-white rounded-t-2xl p-6 shadow-lg h-full">
          <div className='flex justify-between items-center mb-2'>
            <h2 className="text-xl font-bold mb-4 text-purple-700">Answers</h2>
            <input 
              type="text" 
              placeholder='Search student Name' 
              className='border rounded-lg px-2 py-1 w-50'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {filteredAnswers.length === 0 ? (
            <div className="text-gray-500 text-center">No answers submitted yet.</div>
          ) : (
            <ul className="space-y-4 overflow-y-auto h-full">
              {[...filteredAnswers].reverse().map((ans, idx) => (
                <li key={idx} className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-semibold text-lg text-blue-700 mb-1">{ans.studentName || 'Anonymous'}</div>
                  <div className="text-gray-800 font-semibold whitespace-pre-line">{ans.answer}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
        
        {/* Pop up for Desktop */}
      <div className="max-sm:hidden fixed inset-0 bg-slate-400/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
          <X onClick={onClose} cursor={'pointer'} className='absolute top-2 right-2' />

          <div className='flex justify-between items-center mb-2'>
            <h2 className="text-xl font-bold mb-4 text-purple-700">Answers</h2>
            <input 
              type="text" 
              placeholder='Search student Name' 
              className='border rounded-lg px-2 py-1 mr-4 w-50' 
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filteredAnswers.length === 0 ? (
            <div className="text-gray-500 text-center">No answers submitted yet.</div>
          ) : (
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {[...filteredAnswers].reverse().map((ans, idx) => (
                <li key={idx} className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-semibold text-lg text-blue-700 mb-1">{ans.studentName || 'Anonymous'}</div>
                  <div className="text-gray-800 font-semibold whitespace-pre-line">{ans.answer}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}