import { MDBCard, MDBCardBody, MDBCardHeader, MDBSpinner, MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { callCloudFunc } from "../../firebaseConfig";
import { useParams } from "react-router-dom";

const Report = () => {
    const [loading, setLoading] = useState(false)
    const [survey, setSurvey] = useState(true)

    const {id} = useParams()

     useEffect(()=> {
      const getQuestionAndAnswer = () => {
        setLoading(true)
        const getSurveyReport = callCloudFunc('getSurveyReport');
        getSurveyReport({surveyId: id})
          .then((res) => {
            console.log(res.data)
            setSurvey(res.data)
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
    {
        survey && (
            <>
            <div className="mb-8 border-bottom border-2 border-primary pb-3">
              <h3 className="mb-0">Survey Details</h3>
            </div>
            <div className="mb-6">
                <h2 className="mb-0">{survey.title}</h2>
                <h5 className="mt-3 text-muted">
                {survey.desc}
                </h5>
            </div>
            
            <div className="d-grid gap-4">
                {
                    survey.questions?.map((item, i)=> {
                        const questiontype = 
                            item.questionType === '1'
                            ? 'checkbox' 
                            : item.questionType === '2' 
                            ? 'radio' : item.questionType === '3' 
                            ? 'textfield' : item.questionType === '4' ? 'rating'
                            : 'dropdown'
                        return(
                        <MDBCard className="border" key={item.id}>
                            <MDBCardHeader>
                                <span className="text-muted">Q.</span> {i+1}. <span>{item.question}</span>
                            </MDBCardHeader>
                            <MDBCardBody>
                                <MDBTable align="middle" bordered>
                                    <MDBTableHead>
                                        <tr>
                                            <th className="fw-bold">Option</th>
                                            <th className="fw-bold">Answered</th>
                                            <th className="fw-bold">Question Type</th>
                                        </tr>
                                    </MDBTableHead>
                                    <MDBTableBody>                     
                                        {
                                            item.questionType === '1' ? (         
                                                <tr>
                                                    <td>{item.question}</td>
                                                    <td>
                                                        {item.userAnswers.map(answer=> (

                                                            <p key={answer.id} className="mb-0">
                                                                {answer.answer} <strong className="ms-4">{answer.totalUserAnswer}</strong>
                                                            </p>
                                                          
                                                        ))}
                                                    </td>
                                                    <td>{questiontype}</td>
                                                </tr>
                                            ) : item.questionType === '2' ? (
                                                <tr>
                                                     <td>{item.question}</td>
                                                    <td>
                                                        {item.userAnswers.map(answer=> (

                                                            <p key={answer.id} className="mb-0">
                                                                {answer.answer}: <strong className="ms-4">{answer.totalUserAnswer}</strong>
                                                            </p>
                                                          
                                                        ))}
                                                    </td>
                                                    <td>{questiontype}</td>
                                                </tr>
                                            ) : item.questionType === '5' ? (
                                                <tr>
                                                    <td>{item.question}</td>
                                                    <td>
                                                        {item.userAnswers.map(answer=> (

                                                            <p key={answer.id} className="mb-0">
                                                                {answer.answer} <strong className="ms-4">{answer.totalUserAnswer}</strong>
                                                            </p>
                                                          
                                                        ))}
                                                    </td>
                                                    <td>{questiontype}</td>
                                                </tr>
                                            ) : item.questionType === '4' ? (
                                                <tr>
                                                    <td>{item.question}</td>
                                                    <td>
                                                    {item.userAnswers.map(answer=> (
                                                        <p key={answer.id} className="mb-0">
                                                            {answer.answer}: <strong className="ms-4">{answer.totalUserAnswer}</strong>
                                                        </p>
                                                    ))}
                                                    </td>
                                                    <td>{questiontype}</td>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <td>{item.question}</td>
                                                    <td>
                                                    {item.userAnswers.map(answer=> (
                                                        <p className="mb-0">{answer.totalUserAnswer}</p>
                                                    ))}
                                                    </td>
                                                    <td>{questiontype}</td>
                                                </tr>
                                            )
                                        }
                                    </MDBTableBody>
                                </MDBTable>
                            </MDBCardBody>
                        </MDBCard>
                    )}) 
                }
            </div>
            </>
            
        )
    }
    </>
  );
};

export default Report;
