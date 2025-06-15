import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GlobalSearch = ({ onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/search-users?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      
      setSearchResults(response.data.users || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (user) => {
    setShowResults(false);
    setSearchQuery('');
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search users by name, email, or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium truncate"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(user.name, searchQuery) 
                    }}
                  />
                  <div 
                    className="text-sm opacity-75 truncate"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(user.email, searchQuery) 
                    }}
                  />
                  {user.mobileNumber && (
                    <div 
                      className="text-xs opacity-60 truncate"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(user.mobileNumber, searchQuery) 
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-col items-end text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  <div className="mt-1 flex space-x-1">
                    {user.isVerified && (
                      <span className="text-green-500" title="Verified">✓</span>
                    )}
                    {user.isSignedAgreement && (
                      <span className="text-blue-500" title="Agreement Signed">📝</span>
                    )}
                    {user.workSubmitted && (
                      <span className="text-orange-500" title="Work Submitted">📤</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-center text-gray-500 text-sm">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
