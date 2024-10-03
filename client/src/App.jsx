import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Display from './components/Display';
import Login from './components/Login';
import UserSignup from './pages/UserSignup';
import UserLogin from './pages/UserLogin';
import AuthCallback from './components/AuthCallback';
import Player from './components/Player';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserLibrary from './pages/UserLibrary';
import UserPlaylist from './pages/UserPlaylist';

function App() {
  const [token, setToken] = React.useState(localStorage.getItem('accessToken'));
  const location = useLocation();

  // Pages where the sidebar should not be shown
  const hideSidebar = ["/user-login", "/user-signup"];

  return (
    <div className="App">
      <header className="App-header">
        <Navbar token={token} setToken={setToken} />
      </header>

      <div className="flex h-screen">

        {/* Conditionally render the sidebar based on the current location */}
        {token && !hideSidebar.includes(location.pathname) && <div className="w-64 flex-shrink-0"><Sidebar /></div>}  {/* Sidebar on the left */}

        <div className="flex-grow overflow-auto h-[calc(100vh-60px)]">  {/* Content area */}
          <Routes>

            {/* Redirect to the main page if already logged in */}
            <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
            
            {/* Route for handling OAuth callback */}
            <Route path="/auth/callback" element={<AuthCallback setToken={setToken} />} />

            <Route path="/user-signup" element={<UserSignup />} /> 

            <Route path="/user-login" element={<UserLogin />} /> 

            <Route path="/user-library" element={<UserLibrary />} />

            <Route path="/user-library-details/:id" element={<UserPlaylist />} />

            {/* Protected route for authenticated users */}
            {token && <Route path="*" element={<Display />} />}

            {/* Redirect all other routes to login if not authenticated */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>

      {/* Render Player at the bottom if the user is authenticated */}
      {token && <Player />}
    </div>
  );
}

export default App;
