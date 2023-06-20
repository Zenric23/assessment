import React, { useEffect, useState } from "react";
import {
  MDBBadge,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { database } from "../../firebaseConfig";

const User = () => {
  const navigate = useNavigate();
  const [loading, setLoading ] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(()=> {
    const getData = () => {
      setLoading(true)
      const collectionRef = collection(database, 'users')
      const q = query(collectionRef)

      onSnapshot(q, (data)=> {
        const newUsers = data.docs.map(item=> {
          return {...item.data(), id: item.id}
        })
        setUsers(newUsers)
        setLoading(false)
      })
    }
    getData()
  }, [])

  console.log(users)
  
  if(loading) {
    return (
      <div className="text-center" style={{marginTop: 200}}>
        <MDBSpinner color="primary" size="lg" style={{ width: '5rem', height: '5rem' }}>
              <span className='visually-hidden'>Loading...</span>
          </MDBSpinner>
      </div>
    )
  }

  return (
    <>
      <div className="mb-5 border-bottom border-2 border-primary pb-3">
        <h3 className="mb-0">Users</h3>
      </div>

      <MDBTable align="middle" bordered className="shadow-sm border border-2">
        <MDBTableHead>
          <tr>
            <th className="fw-bold">Email</th>
            {/* <th className="fw-bold">View</th> */}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {
            users.length > 0 && users.map(item=> (
              <tr>
                <td>{item.email}</td>
                {/* <td>
                  <Link
                    to="/user/321"
                    style={{ cursor: "pointer" }}
                    className="bg-success text-white p-1 rounded"
                  >
                    <AiFillEye size={18} />
                  </Link>
                </td> */}
              </tr>
            ))
          }
        </MDBTableBody>
      </MDBTable>
    </>
  );
};

export default User;
