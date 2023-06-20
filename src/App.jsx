import { useContext, useEffect, useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import {
  Route,
  Routes,
  Outlet,
  Navigate,
  useLocation
} from "react-router-dom";
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import User from './pages/User';
import Survey from './pages/Survey';
import SurveyReport from './pages/SurveyReport';
import AddSurvey from './pages/AddSurvey';
import EditSurvey from './pages/EditSurvey';
import Report from './pages/Report';
import { onAuthStateChanged } from 'firebase/auth';
import {auth, callCloudFunc} from '../firebaseConfig';
import { UserContext } from './context/userContext';
import UserHome from './pages/client/UserHome';
import AnswerSurvey from './pages/client/AnswerSurvey';
import { MDBSpinner } from 'mdb-react-ui-kit';


function App() {
  const {setUser, user, state, setState} = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const {pathname} = useLocation()


  
  useEffect(()=> {
    onAuthStateChanged(auth, (user)=> {
      if(user && !location.path !== 'login'){
        setState('logging')
        const getUser = callCloudFunc('getUser');
        getUser({email: user.email})
          .then((result) => {
            console.log(result.data);
            setUser({...user, isAdmin: result.data.isAdmin, userId: result.data.id, surveysTaken: result.data.surveysTaken})
            setState('logged')
          }).catch((error) => {
            console.log(error);
          });
      }
    })
  }, [])

  if(state === 'logging') {
    return (
      <div className="text-center mt-5">
        <MDBSpinner color="primary" size="lg" style={{ width: '7rem', height: '7rem', marginTop: 200 }}>
              <span className='visually-hidden'>Loading...</span>
          </MDBSpinner>
      </div>
    )
  }


  const PrivateRoutes = () => {
    return (
      user ? <Outlet /> :  <Navigate to="/login" />
    )
  }

 

  
  return (
    <>
      {user && <Navbar />} 
      <div className="d-flex">
        {user  && <Sidebar />} 
        <div className="p-5 w-100">
          <Routes>
            <Route element={!user && <Login />} path="/login" /> 
            <Route element={!user && <Register />} path="/register" /> 
            <Route element={<PrivateRoutes />}>
              <Route element={user?.isAdmin ? <Home /> : <UserHome />} path="/" />
              <Route element={<AnswerSurvey />} path="/survey/:id" />
              <Route element={<User />} path="/user" />
              <Route element={<Survey />} path="/survey" />
              <Route element={<AddSurvey />} path="/add-survey" />
              <Route element={<EditSurvey />} path="/edit-survey/:id" />
              <Route element={<SurveyReport />} path="/survey-report" />
              <Route element={<Report />} path="/report/:id" />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App 
