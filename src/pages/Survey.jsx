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
import {useNavigate} from 'react-router-dom'
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { callCloudFunc, database } from "../../firebaseConfig";

const Survey = () => {

  const [surveys, setSurveys] = useState([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(()=> {
    const getData = () => {
      setLoading(true)
      const collectionRef = collection(database, 'survey')
      const q = query(collectionRef, orderBy('createdAt', 'desc'))

      onSnapshot(q, (data)=> {
        const newSurveys = data.docs.map(item=> {
          return {...item.data(), id: item.id}
        })
        setSurveys(newSurveys)
        setLoading(false)
      })
    } 
    getData()
  }, [])


  const handleDelete = (id) => {
    const deleteSurvey = callCloudFunc('deleteSurvey');
    if(window.confirm('Proceed to delete?')) {
      deleteSurvey({id})
        .then(() => {
          
        }).catch((error) => {
          console.log(error);
          window.alert('survey failed to delete.')
        });
    }
  }


  if(loading) {
    return (
      <div className="text-center mt-5">
        <MDBSpinner color="primary" size="lg" style={{ width: '5rem', height: '5rem' }}>
              <span className='visually-hidden'>Loading...</span>
          </MDBSpinner>
      </div>
    )
  }

  return (
    <>
    <div className="mb-5 border-bottom border-2 border-primary pb-3">
        <h3 className="mb-0">Survey</h3>
    </div>
    <MDBCard className="border border-2 rounded-0">
      <MDBCardHeader>
        <MDBBtn onClick={()=> navigate('/add-survey')} className="float-end" color="primary">Add Survey</MDBBtn>
      </MDBCardHeader>
      <MDBCardBody>
        <MDBTable align="middle" bordered>
          <MDBTableHead>
            <tr>
              <th className="fw-bold">Title</th>
              <th className="fw-bold">Desc</th>
              <th className="fw-bold">Action</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {
              surveys?.map(survey=> (
                <tr key={survey.id}>
                  <td>
                    {survey.title}
                  </td>
                  <td>
                  {survey.desc}
                  </td>
                  <td className="d-flex gap-2">
                    <span className="bg-primary text-white px-1 rounded" style={{cursor: 'pointer'}} onClick={()=> navigate(`/edit-survey/${survey.id}`)}>
                        <AiFillEdit size={18} />
                    </span>
                    {/* <span className="bg-success text-white px-1 rounded" style={{cursor: 'pointer'}}>
                        <AiFillEye size={18} />
                    </span> */}
                    <span onClick={()=>handleDelete(survey.id)} className="bg-danger text-white px-1 rounded" style={{cursor: 'pointer'}}>
                        <AiFillDelete size={18} />
                    </span>
                  </td>
                </tr>
              ))
            }
          </MDBTableBody>
        </MDBTable>
        {surveys.length === 0 && <p className="text-muted text-center mt-5">No survey added yet.</p>}
      </MDBCardBody>
    </MDBCard>
    </>
  );
};

export default Survey;
