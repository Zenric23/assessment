import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { UserContext } from '../context/userContext';

const Navbar = () => {

  const {setUser, user, setState} = useContext(UserContext)

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null)
      setUser(false)
      window.location.pathname = '/login'
    }).catch((error) => {
      console.log(error)
    });
  }

  return (
    <div className='navbar px-4 d-flex align-items-center justify-content-between'>
      <h5 className='mb-0 fw-bold'>Survey App</h5>
      <span onClick={handleLogout} to="/login" className="text-right text-primary mb-0 ms-auto" style={{cursor: 'pointer'}}>
        <span className='me-3 text-black'>{user.email}</span>
        <span className="me-3">||</span>
        Logout
      </span>
    </div>
  )
}

export default Navbar