import { Routes, Route, Navigate } from "react-router-dom"
import Home from "../pages/Home"
import ChallengesLayout from "../pages/ChallengesLayout"
import AuthLayout from "../layouts/auth/AuthLayout/AuthLayout"
import Login from "../pages/Login/Login"
import MainLayout from "../layouts/portal/MainLayout/MainLayout"
import ProtectedRoute from "./ProtectedRoute"
import ManageUsers from "../pages/ManageUsers/ManageUsers"
import NewChallenge from "../pages/Challenges/NewChallenge/NewChallenge"
import ChallengeEdit from "../pages/Challenges/NewChallenge/ChallengeEdit"
import Challenges from "../pages/Challenges/Challenges"
import ChallengeDetails from "../pages/Challenges/ChallengeDetails/ChallengeDetails"
import ActivityLogs from "../pages/ActivityLogs/ActivityLogs"

function AppRoutes() {
  return (
    <Routes>
      <Route path='/auth' element={<AuthLayout />}>
        <Route path='login' element={<Login />} />
      </Route>

      <Route path="/" element={<MainLayout />}>

        <Route path='' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        <Route path='challenges'
          element={
            <ProtectedRoute>
              <ChallengesLayout />
            </ProtectedRoute>
          }>
          <Route index element={
                <ProtectedRoute>
                  <Challenges/>
                </ProtectedRoute>
          } />
        </Route>

        <Route path='challenge'>
          <Route path=':id' element={
            <ProtectedRoute>
              <ChallengeDetails />
            </ProtectedRoute>
          } />
        </Route>

        <Route path='challenge/edit'>
          <Route path=':id' element={
            <ProtectedRoute>
              <ChallengeEdit />
            </ProtectedRoute>
          } />
        </Route>

        <Route path='challenges/new' element={
          <ProtectedRoute>
            <NewChallenge />
          </ProtectedRoute>
        } />

        <Route path='/manage-users' element={
          <ProtectedRoute>
            <ManageUsers/> 
          </ProtectedRoute>
        }/>

        <Route path='/activity-logs' element={
          <ProtectedRoute>
            <ActivityLogs />
          </ProtectedRoute>
        } />

      </Route>
      <Route path='*' element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes