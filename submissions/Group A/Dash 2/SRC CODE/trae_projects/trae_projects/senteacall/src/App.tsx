
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallProtectionDashboard from './pages/CallProtectionDashboard';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<CallProtectionDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
