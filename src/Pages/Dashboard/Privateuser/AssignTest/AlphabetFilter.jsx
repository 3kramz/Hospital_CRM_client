const AlphabetFilter = ({ selectedLetter, onSelectLetter }) => {
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="w-full mt-6 mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => onSelectLetter(selectedLetter === letter ? null : letter)}
            className={`
              w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-medium transition-all duration-200
              ${
                selectedLetter === letter
                  ? "bg-secondary text-white shadow-md transform scale-110"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-secondary border border-gray-200"
              }
            `}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetFilter;