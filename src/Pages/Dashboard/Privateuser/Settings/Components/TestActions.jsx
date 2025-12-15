import { FaSearch, FaPlus } from "react-icons/fa";

const TestActions = ({ search, setSearch, onAdd }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {/* Search */}
            <div className="relative w-full md:w-96">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search tests by name or department..." 
                    className="input input-bordered pl-10 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* Add Button */}
            <button 
                onClick={onAdd} 
                className="btn btn-primary text-white gap-2 px-6 shadow-lg shadow-primary/30 w-full md:w-auto hover:scale-105 transition-transform"
            >
                <FaPlus /> Add New Test
            </button>
        </div>
    );
};

export default TestActions;
