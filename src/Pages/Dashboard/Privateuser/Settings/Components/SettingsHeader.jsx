const SettingsHeader = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">System Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage tests, users, and hospital configurations</p>
            </div>
            
            {/* Modern Tab Switcher */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <button 
                    onClick={() => setActiveTab('tests')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'tests' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                >
                    Test Management
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                >
                    User Management
                </button>
            </div>
        </div>
    );
};

export default SettingsHeader;
