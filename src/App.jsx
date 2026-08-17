import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';
import Playlists from './pages/Playlists';
import Forum from './pages/Forum';
import ScrollCharacter, { FloatingLetters } from './components/ScrollCharacter';

function Layout({ children }) {
  const location = useLocation();
  const characterVariant = ['/forum', '/playlists'].includes(location.pathname) ? 'student' : 'teacher';

  return (
    <div className="app-shell">
      <FloatingLetters />
      <ScrollCharacter
        variant={characterVariant}
        label={`Illustration animée ${characterVariant === 'teacher' ? 'd’un enseignant' : 'd’une étudiante'}`}
      />
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/video/:id"
            element={
              <Layout>
                <VideoDetail />
              </Layout>
            }
          />
          <Route
            path="/upload"
            element={
              <Layout>
                <Upload />
              </Layout>
            }
          />
          <Route
            path="/playlists"
            element={
              <Layout>
                <Playlists />
              </Layout>
            }
          />
          <Route
            path="/forum"
            element={
              <Layout>
                <Forum />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;