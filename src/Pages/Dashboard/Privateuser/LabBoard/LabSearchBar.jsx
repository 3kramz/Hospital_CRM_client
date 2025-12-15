import { FiSearch } from 'react-icons/fi';

const LabSearchBar = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search Inv ID, Name, Test..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10 h-10 rounded-xl focus:outline-none focus:border-secondary"
            />
        </div>
    );
};

export default LabSearchBar;
