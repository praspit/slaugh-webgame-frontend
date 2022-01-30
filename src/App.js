import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import { useState} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {
  const [data,setData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu setData={setData}/>} />
        <Route path="/Lobby/:roomId" element={<Lobby data={data} setData={setData}/>} />  
      </Routes>
    </Router>
  );
}

export default App;