import React, { useContext, useEffect, useState } from "react";
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
import { collection, onSnapshot, or, orderBy, query, where } from "firebase/firestore";
import { database } from "../../../firebaseConfig";
import { UserContext } from "../../context/userContext";

const UserHome = () => {
  const {user} = useContext(UserContext)

  
  const [surveys, setSurveys] = useState([]) 
  const [loading, setLoading] = useState(false)


  useEffect(()=> {
    // get realtime surveys
    const getData = () => {
      const collectionRef = collection(database, 'survey')
      const q = query(
        collectionRef,
        orderBy('createdAt', 'desc')
      )

      setLoading(true)
      onSnapshot(q, (data)=> {
        let filteredSurveys = []

        const newSurveys = data.docs.map(item=> {
          return {...item.data(), id: item.id, done: false}
        })

        if(user?.surveysTaken?.length > 0) {
          for(let survey of newSurveys) {
            if(user.surveysTaken.includes(survey.id)) {
              filteredSurveys.push({...survey, done: true})
            } else {
              filteredSurveys.push({...survey, done: false})
            }
          }
          setSurveys(filteredSurveys)
          setLoading(false)
          return
        }

        setSurveys(newSurveys)
        setLoading(false)
      })
    }
    getData()
  }, [])
  console.log(surveys)

  if(loading) {
    return   (
      <div className="text-center mt-5">
        <MDBSpinner color="primary" style={{ width: '5rem', height: '5rem' }}>
          <span className='visually-hidden'>Loading...</span>
      </MDBSpinner>
      </div>
    ) 
      
  }

  return (
    <div>
 
      <div className="mb-5 border-bottom border-2 border-primary pb-3">
        <h3 className="mb-0">Surveys</h3>
      </div>

      <MDBTable align="middle" bordered className="shadow-sm border border-2">
        <MDBTableHead>
          <tr>
            <th className="fw-bold">Title</th>
            <th className="fw-bold">Description</th>
            <th className="fw-bold">Action</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {
            surveys.map(survey=> 
              (<tr key={survey.id}>
                <td>{survey.title}</td>
                <td>{survey.desc}</td>
                <td>
                  {
                    survey.done ? (
                      <MDBBtn
                        to={`/survey/${survey.id}`}
                        style={{ cursor: "pointer" }}
                        className="text-white p-2 rounded btn btn-secondary"
                        disabled={true}
                      >
                        Done
                      </MDBBtn>
                    ) : (
                      <Link
                      to={`/survey/${survey.id}`}
                      style={{ cursor: "pointer" }}
                      className="text-white p-2 rounded btn btn-success"
                      >
                        Take
                      </Link>
                    )
                  }
                </td>
              </tr>)
            )
          }
         
        </MDBTableBody>
      </MDBTable>
     
      {
        (!loading && surveys.length === 0) && <p className="text-center text-muted pt-4">No survey yet.</p>
      }
    </div>
  );
};

export default UserHome;
