import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import { useState} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {
  const [data,setData] = useState(JSON.parse(sessionStorage.getItem('data')) || null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu data={data} setData={setData}/>} />
        <Route path="/Lobby/:roomId" element={<Lobby data={data} setData={setData}/>} />  
      </Routes>
    </Router>
  );
}

export default App;