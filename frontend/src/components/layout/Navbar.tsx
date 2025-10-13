import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar - Clean & Simple */}
      <nav className="hidden sm:block bg-white border-b border-pitt-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo - Clean & Simple */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-pitt-black flex items-center justify-center font-bold text-xl text-white">
                P
              </div>
              <span className="font-bold text-xl text-pitt-black">PittPool</span>
            </Link>
            
            {/* Navigation */}
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive('/dashboard')
                        ? 'text-pitt-black'
                        : 'text-pitt-gray-500 hover:text-pitt-black'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/find-ride"
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive('/find-ride')
                        ? 'text-pitt-black'
                        : 'text-pitt-gray-500 hover:text-pitt-black'
                    }`}
                  >
                    Find Ride
                  </Link>
                  <Link
                    to="/post-ride"
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive('/post-ride')
                        ? 'text-pitt-black'
                        : 'text-pitt-gray-500 hover:text-pitt-black'
                    }`}
                  >
                    Post Ride
                  </Link>
                  <Link
                    to="/my-rides"
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive('/my-rides')
                        ? 'text-pitt-black'
                        : 'text-pitt-gray-500 hover:text-pitt-black'
                    }`}
                  >
                    My Rides
                  </Link>
                  <Link
                    to="/messages"
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive('/messages')
                        ? 'text-pitt-black'
                        : 'text-pitt-gray-500 hover:text-pitt-black'
                    }`}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isActive('/profile')
                        ? 'text-pitt-black'
                        : 'text-pitt-gray-500 hover:text-pitt-black'
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-4 py-2 text-pitt-gray-500 hover:text-pitt-black rounded-lg font-semibold text-sm transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2 text-pitt-gray-600 hover:text-pitt-black rounded-lg font-semibold text-sm transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="ml-2 px-6 py-2.5 text-white rounded-xl font-semibold text-sm hover:shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Subtle & Clean */}
      {user && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pitt-gray-200 px-2 py-3 z-50 safe-area-pb">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Link
              to="/dashboard"
              className="flex flex-col items-center gap-1 min-w-[68px] py-1 active:opacity-60 transition-all"
            >
              <div className={`transition-colors ${
                isActive('/dashboard') 
                  ? 'text-pitt-black' 
                  : 'text-pitt-gray-400'
              }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${
                isActive('/dashboard') ? 'text-pitt-black' : 'text-pitt-gray-400'
              }`}>
                Home
              </span>
            </Link>
            <Link
              to="/find-ride"
              className="flex flex-col items-center gap-1 min-w-[68px] py-1 active:opacity-60 transition-all"
            >
              <div className={`transition-colors ${
                isActive('/find-ride') 
                  ? 'text-pitt-black' 
                  : 'text-pitt-gray-400'
              }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${
                isActive('/find-ride') ? 'text-pitt-black' : 'text-pitt-gray-400'
              }`}>
                Find
              </span>
            </Link>
            <Link
              to="/post-ride"
              className="flex flex-col items-center gap-1 min-w-[68px] py-1 active:opacity-60 transition-all"
            >
              <div className={`transition-colors ${
                isActive('/post-ride') 
                  ? 'text-pitt-black' 
                  : 'text-pitt-gray-400'
              }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${
                isActive('/post-ride') ? 'text-pitt-black' : 'text-pitt-gray-400'
              }`}>
                Post
              </span>
            </Link>
            <Link
              to="/messages"
              className="flex flex-col items-center gap-1 min-w-[68px] py-1 active:opacity-60 transition-all"
            >
              <div className={`transition-colors ${
                isActive('/messages') 
                  ? 'text-pitt-black' 
                  : 'text-pitt-gray-400'
              }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${
                isActive('/messages') ? 'text-pitt-black' : 'text-pitt-gray-400'
              }`}>
                Messages
              </span>
            </Link>
            <Link
              to="/profile"
              className="flex flex-col items-center gap-1 min-w-[68px] py-1 active:opacity-60 transition-all"
            >
              <div className={`transition-colors ${
                isActive('/profile') 
                  ? 'text-pitt-black' 
                  : 'text-pitt-gray-400'
              }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className={`text-xs font-medium ${
                isActive('/profile') ? 'text-pitt-black' : 'text-pitt-gray-400'
              }`}>
                Profile
              </span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;

