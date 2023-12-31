import React, { useContext, useState } from 'react'
import {
  MDBInput,
  MDBCol,
  MDBRow,
  MDBCheckbox,
  MDBBtn,
  MDBContainer
} from 'mdb-react-ui-kit';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const Login = () => {

  const {setUser} = useContext(UserContext)
  
  const [login, setLogin] = useState({})
  const [err, setErr] = useState(false)

  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setLogin(prev=> {
      return {
        ...prev,
        [e.target.name]: e.target.value
      }
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    signInWithEmailAndPassword(auth, login.email, login.pass)
      .then((userCredential) => {
        setErr(false)
        setUser(userCredential)
        // window.location.pathname = '/'
        navigate('/')
      })
      .catch((error) => {
        setErr(true)
      });
  }

  return (
    <MDBCol style={{marginTop: 150}} md={3} className='mx-auto'>
      <h3 className='text-center mb-5'>Login</h3>
      {err && <div className="alert alert-danger mb-4">Email or password is incorrect.</div>}
      <form onSubmit={handleSubmit}>
      <MDBInput required className='mb-4' name='email' value={login?.email} type='email' onChange={handleInputChange} label='Email address' />
      <MDBInput required className='mb-4' name='pass' value={login?.pass} type='password' onChange={handleInputChange} label='Password' />

      <MDBBtn type='submit' block>
        Sign in
      </MDBBtn>
      <Link to="/register" className='d-block text-center m-4' style={{textDecoration: 'underline'}}>Register here</Link>
    </form>
    </MDBCol>
  )
}

export default Login