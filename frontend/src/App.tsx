import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import DemoHub from './pages/DemoHub'
import ConcreteEstimator from './pages/ConcreteEstimator'
import AsphaltEstimator from './pages/AsphaltEstimator'
import LandscapeEstimator from './pages/LandscapeEstimator'
import DeckEstimator from './pages/DeckEstimator'
import RoofingEstimator from './pages/RoofingEstimator'
import FenceEstimator from './pages/FenceEstimator'
import TempFenceEstimator from './pages/TempFenceEstimator'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import AIReceptionist from './pages/AIReceptionist'
import EmbedPage from './pages/EmbedPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/demo" element={<Layout><DemoHub /></Layout>} />
        <Route path="/demo/concrete" element={<Layout><ConcreteEstimator /></Layout>} />
        <Route path="/demo/asphalt" element={<Layout><AsphaltEstimator /></Layout>} />
        <Route path="/demo/landscape" element={<Layout><LandscapeEstimator /></Layout>} />
        <Route path="/demo/decks" element={<Layout><DeckEstimator /></Layout>} />
        <Route path="/demo/roofing" element={<Layout><RoofingEstimator /></Layout>} />
        <Route path="/demo/fencing" element={<Layout><FenceEstimator /></Layout>} />
        <Route path="/demo/temp-fence" element={<Layout><TempFenceEstimator /></Layout>} />
        <Route path="/demo/ai-receptionist" element={<Layout><AIReceptionist /></Layout>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/embed" element={<EmbedPage />} />
      </Routes>
    </HashRouter>
  )
}
