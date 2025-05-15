const AlphabetFilter = ({ selectedLetter, onSelectLetter }) => {
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const firstRow = alphabet.slice(0, 14);
  const secondRow = alphabet.slice(14);

  return (
    <div className="w-full mt-11 text-2xl">
      <div className="flex flex-wrap gap-1 justify-center mb-4">
        {firstRow.map(letter => (
          <button
            key={letter}
            className={`w-9 h-9 flex items-center justify-center rounded ${
              selectedLetter === letter ? 'bg-secondary text-primary font-bold' : 'bg-primary text-white'
            }`}
            onClick={() => onSelectLetter(selectedLetter === letter ? null : letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 justify-center mb-1">
        {secondRow.map(letter => (
          <button
            key={letter}
            className={`w-9 h-9 flex items-center justify-center rounded  ${
              selectedLetter === letter ?  'bg-secondary text-primary font-bold' : 'bg-primary text-white'
            }`}
            onClick={() => onSelectLetter(selectedLetter === letter ? null : letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetFilter;