import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Academic from './pages/Academic';
import { useAuth } from './context/AuthContext';

// ... (LayoutWrapper code)
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isInternalPage = location.pathname === '/dashboard' || location.pathname === '/profile' || location.pathname.startsWith('/academic');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {(!isAuthPage && !isInternalPage) && <Navbar />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {(!isAuthPage && !isInternalPage) && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/academic/*" element={<Academic />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
