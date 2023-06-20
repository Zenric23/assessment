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
import {Link, useNavigate} from 'react-router-dom'
import { callCloudFunc } from "../../firebaseConfig";
// import { AiFillEye } from 'react-icons/ai'

const SurveyReport = () => {

  const [loading, setLoading] = useState(false)
  const [surveys, setSurveys] = useState([])

    useEffect(()=> {
      const getQuestionAndAnswer = () => {
        setLoading(true)
        const surveyTableReport = callCloudFunc('surveyTableReport');
        surveyTableReport()
          .then((res) => {
            setSurveys(res.data)
            setLoading(false)
          }).catch((error) => {
            console.log(error);
            setLoading(false)
          });
      }
      getQuestionAndAnswer()
    }, [])


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
        <h3 className="mb-0">Survey Report</h3>
    </div>
        
        <MDBTable align="middle" bordered className="shadow-sm border border-2">
          <MDBTableHead>
            <tr>
              <th className="fw-bold">Title</th>
              {/* <th className="fw-bold">Desc</th> */}
              <th className="fw-bold">Total Items</th>
              <th className="fw-bold">Submitted</th>
              <th className="fw-bold">View</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody> 
            {
              surveys.length > 0 && surveys.map(survey=> (
                <tr key={survey.id}>
                  <td>
                    {survey.title}
                  </td>
                  {/* <td>{survey.desc}</td> */}
                  <td>{survey.totalQuestion}</td>
                  <td>{survey.totalUserSubmitted}</td>
                  <td>
                    <Link to={`/report/${survey.id}`} style={{cursor: 'pointer'}}  className="bg-success text-white p-1 rounded">
                      <AiFillEye size={18} />
                    </Link>
                  </td>
                </tr> 
              ))
            }
          </MDBTableBody>
        </MDBTable>
        {surveys.length === 0 && <p className="mt-5 text-muted text-center">No data yet.</p>}
    </>
  );
};

export default SurveyReport;
