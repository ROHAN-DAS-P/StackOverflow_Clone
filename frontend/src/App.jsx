import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import QuestionsList from './pages/questions/QuestionsList'
import QuestionDetail from './pages/questions/QuestionDetail'
import CreateQuestion from './pages/questions/CreateQuestion'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Profile from './pages/profile/Profile'
import Search from './pages/Search'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

function App() {
  const { token, loadTokenFromStorage } = useAuthStore()

  useEffect(() => {
    loadTokenFromStorage()
  }, [loadTokenFromStorage])

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/questions" element={<QuestionsList />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/questions/create" element={token ? <CreateQuestion /> : <Navigate to="/auth/login" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
