import React, { useState } from 'react'
import {
  MDBInput,
  MDBCol,
  MDBRow,
  MDBCheckbox,
  MDBBtn,
  MDBContainer
} from 'mdb-react-ui-kit';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate = useNavigate()
  
  const [login, setLogin] = useState({})
  const [err, setErr] = useState(false)

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
    createUserWithEmailAndPassword(auth, login.email, login.pass)
      .then(()=> {
          navigate('/login')
        })
        .catch(err=> {
            setErr(true)
        })
  }

  return (
    <MDBCol style={{marginTop: 150}} md={3} className='mx-auto'>
      <h3 className='text-center mb-5'>Register</h3>
      {err && <div className="alert alert-danger mb-4">Email is already taken .</div>}
      <form onSubmit={handleSubmit}>
      <MDBInput required className='mb-4' name='email' value={login?.email} type='email' onChange={handleInputChange} label='Email address' />
      <MDBInput required className='mb-4' name='pass' value={login?.pass} type='password' onChange={handleInputChange} label='Password' />

      <MDBBtn type='submit' block>
        Sign up
      </MDBBtn>
      <Link to="/login" className='d-block text-center m-4' style={{textDecoration: 'underline'}}>Login here</Link>
    </form>
    </MDBCol>
  )
}

export default Login