import './App.scss';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserHome from './components/UserHome';
import Volunteer from './components/Volunteer';
import DeviceView from './components/DeviceView';
function App() {
  return (
    <div className="App">

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/UserHome' element={<UserHome />} />
        <Route path='/Volunteer' element={<Volunteer />} />
        <Route path='/DeviceView' element={<DeviceView />} />
      </Routes>
    </div>
  );
}

export default App;
