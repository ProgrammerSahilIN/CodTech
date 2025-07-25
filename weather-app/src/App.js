import { Toaster } from 'react-hot-toast';
import './App.css';
import "./Style/responsive.css";
import Home from './Component/Home';

function App() {
  return (
    <>
      <Home/>
      <Toaster/>
    </>
  );
}

export default App;
