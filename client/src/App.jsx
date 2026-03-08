import { BrowserRouter, Routes, Route } from "react-router-dom";
import CareerPredictor from "./pages/CareerPredictor";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<CareerPredictor />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;