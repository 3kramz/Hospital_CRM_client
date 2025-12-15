import { IoCloseOutline, IoFlaskOutline } from "react-icons/io5";

const SelectedTestsCart = ({ selectedTests, onRemoveTest, onProceed, totalAmount }) => {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-40px)]">
        <div className="p-5 bg-primary text-white flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            Selected Tests
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {selectedTests.length}
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {selectedTests.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-10">
              <IoFlaskOutline className="text-4xl opacity-50" />
              <p className="text-sm">No tests selected yet</p>
            </div>
          ) : (
            selectedTests.map((test) => (
              <div
                key={test.test_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4
                    className="font-medium text-gray-800 text-sm truncate"
                    title={test.name}
                  >
                    {test.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">৳ {test.price}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTest(test.test_id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-full transition-colors"
                >
                  <IoCloseOutline className="text-lg" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              ৳ {totalAmount}
            </span>
          </div>

          <button
            onClick={onProceed}
            disabled={selectedTests.length === 0}
            className={`
                  w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all transform active:scale-95
                  ${
                    selectedTests.length > 0
                      ? "bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/30"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                `}
          >
            Proceed to Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedTestsCart;
