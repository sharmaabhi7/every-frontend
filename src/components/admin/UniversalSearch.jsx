import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const UniversalSearch = ({ onResultSelect, placeholder = "Search users, agreements, PDFs, work..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults({});
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, activeTab]);

  const performSearch = async () => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const searchType = activeTab === 'all' ? '' : activeTab;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/universal-search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      
      setSearchResults(response.data.results || {});
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({});
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result, type) => {
    setShowResults(false);
    setSearchQuery('');
    if (onResultSelect) {
      onResultSelect(result, type);
    }
  };

  const getResultCount = () => {
    return Object.values(searchResults).reduce((total, results) => total + (results?.length || 0), 0);
  };

  const renderUserResult = (user) => (
    <div
      key={user._id}
      onClick={() => handleResultClick(user, 'user')}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <div className="text-xs text-gray-400">{user.mobileNumber}</div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          {user.isVerified && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
          )}
          {user.isSignedAgreement && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Signed</span>
          )}
          {user.workSubmitted && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Submitted</span>
          )}
          {user.isPenalized && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Penalized</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderAgreementResult = (agreement) => (
    <div
      key={agreement._id}
      onClick={() => handleResultClick(agreement, 'agreement')}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">{agreement.userId?.name}</div>
          <div className="text-sm text-gray-500">{agreement.userId?.email}</div>
          <div className="text-xs text-gray-400">
            Signed: {new Date(agreement.signedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Version {agreement.agreementId?.version || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPDFResult = (pdf) => (
    <div
      key={pdf._id}
      onClick={() => handleResultClick(pdf, 'pdf')}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">{pdf.title}</div>
          <div className="text-sm text-gray-500">{pdf.description}</div>
          <div className="text-xs text-gray-400">
            {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(pdf.uploadedAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            pdf.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {pdf.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderWorkResult = (work) => (
    <div
      key={work._id}
      onClick={() => handleResultClick(work, 'work')}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div>
        <div className="font-medium text-gray-900">{work.userId?.name}</div>
        <div className="text-sm text-gray-500">{work.userId?.email}</div>
        <div className="text-xs text-gray-400 mt-1">
          {work.content.substring(0, 100)}...
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {work.submittedAt ? `Submitted: ${new Date(work.submittedAt).toLocaleDateString()}` : 'Draft'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {showResults && getResultCount() > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {['all', 'users', 'agreements', 'pdfs', 'work'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium capitalize ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} {tab !== 'all' && searchResults[tab] && `(${searchResults[tab].length})`}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="max-h-80 overflow-y-auto">
            {(activeTab === 'all' || activeTab === 'users') && searchResults.users?.length > 0 && (
              <div>
                {activeTab === 'all' && <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">Users</div>}
                {searchResults.users.map(renderUserResult)}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'agreements') && searchResults.signedAgreements?.length > 0 && (
              <div>
                {activeTab === 'all' && <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">Signed Agreements</div>}
                {searchResults.signedAgreements.map(renderAgreementResult)}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'pdfs') && searchResults.pdfs?.length > 0 && (
              <div>
                {activeTab === 'all' && <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">PDFs</div>}
                {searchResults.pdfs.map(renderPDFResult)}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'work') && searchResults.works?.length > 0 && (
              <div>
                {activeTab === 'all' && <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">Work Content</div>}
                {searchResults.works.map(renderWorkResult)}
              </div>
            )}

            {getResultCount() === 0 && (
              <div className="p-4 text-center text-gray-500">
                <div className="text-2xl mb-2">🔍</div>
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
