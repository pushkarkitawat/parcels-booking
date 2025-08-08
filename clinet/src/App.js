
import './App.css';
import LoginPage from './LoginPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StationComponent from './StationComponent';
import Booking from './agent/booking';
import AddBusDetail from './Addbus';
import BookingList from './bookinglist';
import DispatchBookings from './loading';
import SingleBookingSearch from './agent/bookingdisplay';
import ResetPassword from './agent/reset';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    // Disable right-click
    const disableRightClick = (e) => {
      e.preventDefault();
      alert('Right-click is disabled.');
    };
  
    // Disable keyboard shortcuts
    const disableInspectKeys = (e) => {
      if (
        e.key === 'F12' || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
        (e.ctrlKey && e.key === 'U') || // View source
        (e.ctrlKey && e.shiftKey && e.key === 'C') // Ctrl+Shift+C
      ) {
        e.preventDefault();
        alert('This action is disabled.');
      }
    };
  
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableInspectKeys);
  
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableInspectKeys);
    };
  }, []);
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/booking" element={<Booking/>} />
      <Route path="/loading" element={<DispatchBookings/>} />
      <Route path="/search" element={<SingleBookingSearch/>}/>
      <Route path="/bookinglist" element={<BookingList/>}/>
      <Route path="/reset" element={<ResetPassword/>}/>
      <Route path="/addbuses" element={<AddBusDetail/>}/>
      <Route path="/addstations" element={<StationComponent/>}/>


    </Routes>
  </Router>
  );
}

export default App;
