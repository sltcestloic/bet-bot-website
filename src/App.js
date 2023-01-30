import Home from './pages/home/Home';
import NotFound from './pages/NotFound'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InDev from './pages/InDev';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
		    <Route path="indev" element={<InDev />} />
		    <Route path='*' element={<NotFound />}/>
      </Routes>
    </Router>
  );
}

export default App;
