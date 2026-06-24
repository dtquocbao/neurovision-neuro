import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Findings from "./pages/Findings";
import Atlas from "./pages/Atlas";
import Score from "./pages/Score";
import Classifier from "./pages/Classifier";
import Disease from "./pages/Disease";
import LR from "./pages/LR";
import About from "./pages/About";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/atlas" element={<Atlas />} />
        <Route path="/score" element={<Score />} />
        <Route path="/classifier" element={<Classifier />} />
        <Route path="/disease" element={<Disease />} />
        <Route path="/lr" element={<LR />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}
