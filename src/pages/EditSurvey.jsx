import React, { useEffect, useState } from "react";
import {
  MDBInput,
  MDBCol,
  MDBRow,
  MDBCheckbox,
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBTextArea,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader, 
  MDBRadio,
  MDBSpinner 
} from "mdb-react-ui-kit";
import { AiOutlinePlus, AiOutlineClose, AiOutlineCheck, AiOutlineStar, AiFillStar } from "react-icons/ai";
import { BsTrashFill } from 'react-icons/bs'
import useModal from "../hooks/useModal";
import Modal from "../components/ui/Modal";
import { v4 as uuidv4 } from 'uuid';
import { callCloudFunc, database } from "../../firebaseConfig";
import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { useParams } from "react-router-dom";
import { collection, documentId, onSnapshot, query, where } from "firebase/firestore";


const EditSurvey = () => {

  const {id} = useParams()
  
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  const [questions, setQuestions] = useState([])
  const [question, setQuestion] = useState('')
  const [questionType, setQuestionType] = useState('')
  const [labels, setlabels] = useState(undefined)
  console.log(questionType)
  const [loading, setLoading] = useState(false)

  const {
    isLoading: modalLoading,
    setIsLoading: setModalLoading,
    openModal,
    setOpenModal,
    closeModal,
    toogleModal,
  } = useModal();



  // update survey details
  const updateSurveyDetails = (e) => {
    e.preventDefault()
    setLoading(true)
    const updateSurveyDetails = callCloudFunc('updateSurveyDetails');
    updateSurveyDetails({id, title, desc})
      .then((result) => {
        console.log(result.data);
        setLoading(false)
        window.alert('survey details updated successfuly')
      }).catch((error) => {
        console.log(error);
        setLoading(false)
        window.alert('survey details failed to update.')
      });
  }

  // add question
  const addQuestionAndAnswer = (e) => {
    e.preventDefault()

    const addQuestionAndAnswer = callCloudFunc('addQuestionAndAnswer');
    setModalLoading(true)
    addQuestionAndAnswer({
      surveyId: id,
      question,
      questionType,
      labels  
    })
      .then(() => {
        setModalLoading(false)
        setQuestions(prev=> [...prev, {
          surveyId: id,
          question,
          questionType,
          labels
        }])
        setQuestionType('')
        setQuestion('')
        setlabels([])
        closeModal()
        window.alert('survey question added successfully.')
      }).catch((error) => {
        console.log(error);
        setModalLoading(false)
        window.alert('survey question failed to add.')
      });
  }
  
  // delete question
  const deleteQuestion = (id) => {
    console.log(id)
    const deleteQuestionsAndAnswers = callCloudFunc('deleteQuestionsAndAnswers');
    if(window.confirm('Do you want to delete that question?')){
      deleteQuestionsAndAnswers({id})
        .then(() => {
          const newArr = questions.filter(item=> item.id !== id)
          setQuestions(newArr)
        }).catch((error) => {
          console.log(error);
          setLoading(false)
        });
    }
  }
  

  // change question type
  const handleQuestionTypeChange = (e) => {
    const type = e.target.value
    setQuestionType(type)
    
    setlabels(()=> {
      if(type === '3' || type === '4') {
        return ''
      } else {
        return [
          {
            id: uuidv4(),
            label: ''
          },
          {
            id: uuidv4(),
            label: ''
          }
        ]
      }
    })

  }


  // add label
  const handleLabelAdd = () => {
    setlabels(prev=> [...prev, { id: uuidv4(), answer: '' }])
  }

  // change label value
  const handleLabelEdit = (e, id) => {
    const newState = labels.map(obj=> {
      if(obj.id === id) {
        return {...obj, answer: e.target.value}
      }
      return obj
    })
    setlabels(newState)
  }

  
  // delete label
  const handleLabelDelete = (id) => {
    const newlabels = labels.filter(item=> item.id !== id) 
    setlabels(newlabels)
  }


  useEffect(()=> {
    // get questions
    const getQuestionAndAnswer = () => {
      setLoading(true)
      const getQuestionsAndAnswers = callCloudFunc('getQuestionsAndAnswers');
      getQuestionsAndAnswers({id})
        .then((res) => {
          console.log(res.data)
          setLoading(false)
          setQuestions(res.data)
        }).catch((error) => {
          console.log(error);
          setLoading(false)
        });
    }
    
    //get survey details
    const getSurveyDetails = () => {
      const collectionRef = collection(database, 'survey')
      const q = query(collectionRef, where(documentId(), '==', id))

      onSnapshot(q, (data)=> {
        const survey = data.docs.map(item=> {
          return {...item.data(), id: item.id}
        })
        setTitle(survey[0].title)
        setDesc(survey[0].desc)
      })
    }

    getQuestionAndAnswer()
    getSurveyDetails()
  
  }, [])


  // Question type cards JSX
  const Selections = ({id, question, questionType, labels}) => {

    // checkbox
    if(questionType === "1") {
      return (
        <div className="shadow-sm rounded border-start border-4 border-primary p-3">
          <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
            <h6>{question}</h6>
            <div>
              <span style={{cursor: 'pointer'}}><BsTrashFill onClick={()=>deleteQuestion(item.id)} /></span>
            </div>
          </div>

          <div>
            {
              labels.map((item, i)=> (
                <MDBCheckbox key={item.id} name='flexCheck' value='' id={`check${i}`} label={item.answer} />
              ))
            }
          </div>
        </div>
      )
    }

    // radio
    if(questionType === "2") {
      return (
        <div className="shadow-sm rounded border-start border-4 border-primary p-3">
          <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
            <h6>{question}</h6>
            <span style={{cursor: 'pointer'}}><BsTrashFill onClick={()=>deleteQuestion(item.id)} /></span>
          </div>
        <div>
          {
            labels.map((item, i)=> (
              <MDBRadio key={item.id} name='flexRadioDefault' id={`radio${i}`} label={item.answer} />
            ))
          }
        </div>
      </div>
      )
    }

    // text field
    if(questionType === "3") {
      return (
        <div className="shadow-sm rounded border-start border-4 border-primary p-3">
           <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
              <h6>{question}</h6>
              <span style={{cursor: 'pointer'}} onClick={()=>deleteQuestion(item.id)}><BsTrashFill /></span>
           </div>
          <MDBTextArea disabled row={3} />
      </div>
      )
    }

    // ratings
    if(questionType === '4') {
      return (
        <div className="shadow-sm rounded border-start border-4 border-primary p-3">
          <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
            <h6>{question}</h6>
            <span style={{cursor: 'pointer'}} onClick={()=>deleteQuestion(item.id)}><BsTrashFill /></span>
          </div>
          <div className="d-flex gap-3 justify-content-center">
          {
            [...Array(5)].map((item, i)=> <span key={i}><AiOutlineStar size={30} /></span>)
          }
          </div>
        </div>
      )
    }

    // dropdown
    if(questionType === '5') {
      return (
        <div className="shadow-sm rounded border-start border-4 border-primary p-3">
          <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
            <h6>{question}</h6>
            <span style={{cursor: 'pointer'}} onClick={()=>deleteQuestion(item.id)}><BsTrashFill /></span>
          </div>
        <select name="" id="" className="w-100 p-2">
          {/* <option value="">-- select --</option> */}
          {
            labels.map(item=> (
              <option key={item.id} value={item.answer}>{item.answer}</option>
            ))
          }
        </select>
      </div>
      )
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
        <h3 className="mb-0">Edit Survey</h3>
      </div>
    
        <MDBRow className="g-4">
          <MDBCol md={4}>
            <MDBCard className="border">
              <MDBCardHeader className="fw-bold">Survey Details</MDBCardHeader>
              <form action="" onSubmit={updateSurveyDetails}>
                <MDBCardBody className="p-4">
                  <MDBCol>
                    <label className="mb-2">Title</label>
                    <MDBInput
                      className="mb-4"
                      type="text"
                      onChange={(e)=> setTitle(e.target.value)}
                      value={title}
                    />
                    <label className="mb-2">Description</label>
                    <MDBTextArea className="mb-4" rows={3} onChange={(e)=> setDesc(e.target.value)} value={desc} />
                    <MDBBtn type="submit" color="primary" disabled={loading} className="w-100">
                      {loading ? (
                          <MDBSpinner color='light' size="sm">
                          <span className='visually-hidden'>Loading...</span>
                        </MDBSpinner>
                        ) : 'Save'
                      }
                    </MDBBtn>
                  </MDBCol>
                </MDBCardBody>
              </form>
            </MDBCard>
          </MDBCol>
          <MDBCol md={8}>
            <MDBCard className="border">
              <MDBCardHeader className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Survey Questionaire</span>
                <MDBBtn
                  type="button"
                  outline
                  className="mx-2"
                  color="dark"
                  onClick={()=> {
                    toogleModal()
                  }}
                >
                  <AiOutlinePlus size={18} />
                  <span className="ms-2">Add New Question</span>
                </MDBBtn>
              </MDBCardHeader>
              <MDBCardBody>
                <div className="d-grid gap-5">
                  {
                    questions.length > 0 && questions.map((item)=> {
                      // <Selections key={item.id} id={item.id} question={item.question} questionType={item.questionType} labels={item.labels} />
                      if(item.questionType === "1") {
                        return (
                          <div className="shadow-sm rounded border-start border-4 border-primary p-3" key={item.id}>
                            <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
                              <h6>{item.question}</h6>
                              <div>
                                <span style={{cursor: 'pointer'}}><BsTrashFill onClick={()=>deleteQuestion(item.id)} /></span>
                              </div>
                            </div>
                  
                            <div>
                              {
                                item.labels.map((item, i)=> (
                                  <MDBCheckbox key={item.id} name='flexCheck' value='' id={`check${i}`} label={item.answer} />
                                ))
                              }
                            </div>
                          </div>
                        )
                      }

                      if(item.questionType === "2") {
                        return (
                          <div className="shadow-sm rounded border-start border-4 border-primary p-3" key={item.id}>
                            <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
                              <h6>{item.question}</h6>
                              <span style={{cursor: 'pointer'}}><BsTrashFill onClick={()=>deleteQuestion(item.id)} /></span>
                            </div>
                          <div>
                            {
                              item.labels.map((item, i)=> (
                                <MDBRadio key={item.id} name='flexRadioDefault' id={`radio${i}`} label={item.answer} />
                              ))
                            }
                          </div>
                        </div>
                        )
                      }

                      if(item.questionType === "3") {
                        return (
                          <div className="shadow-sm rounded border-start border-4 border-primary p-3" key={item.id}>
                             <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
                                <h6>{item.question}</h6>
                                <span style={{cursor: 'pointer'}} onClick={()=>deleteQuestion(item.id)}><BsTrashFill /></span>
                             </div>
                            <MDBTextArea disabled row={3} />
                        </div>
                        )
                      }

                      if(item.questionType === '4') {
                        return (
                          <div className="shadow-sm rounded border-start border-4 border-primary p-3" key={item.id}>
                            <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
                              <h6>{item.question}</h6>
                              <span style={{cursor: 'pointer'}} onClick={()=>deleteQuestion(item.id)}><BsTrashFill /></span>
                            </div>
                            <div className="d-flex gap-3 justify-content-center">
                            {
                              [...Array(5)].map((item, i)=> <span key={i}><AiOutlineStar size={30} /></span>)
                            }
                            </div>
                          </div>
                        )
                      }

                      if(item.questionType === '5') {
                        return (
                          <div className="shadow-sm rounded border-start border-4 border-primary p-3" key={item.id}>
                            <div className="d-flex justify-content-between mb-3 pb-2 border-2 border-bottom">
                              <h6>{item.question}</h6>
                              <span style={{cursor: 'pointer'}} onClick={()=>deleteQuestion(item.id)}><BsTrashFill /></span>
                            </div>
                          <select name="" id="" className="w-100 p-2">
                            {/* <option value="">-- select --</option> */}
                            {
                              item.labels.map(item=> (
                                <option key={item.id} value={item.answer}>{item.answer}</option>
                              ))
                            }
                          </select>
                        </div>
                        )
                      }
                  

                    })
                  }
                  {questions.length === 0 && <p className="text-muted mt-4 text-center">No question yet.</p>}
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>


      <Modal
        title="New Question"
        size="xl"
        open={openModal}
        setOpen={setOpenModal}
        closeModal={closeModal}
        handleSubmit={addQuestionAndAnswer}
      >
        <div >
          <MDBCard>
            <MDBCardBody>
              <MDBRow>
                <MDBCol md={6}>
                  <div className="mb-4">
                    <label className="mb-2">Question</label>
                    <MDBTextArea required type="text" rows={3} value={question} onChange={(e)=> setQuestion(e.target.value)}/>
                  </div>
                  <div className="mb-4">
                    <label className="mb-2">Question Answer Type</label>
                    <select required className="d-block p-2 rounded w-100" value={questionType} onChange={(e)=> handleQuestionTypeChange(e)}>
                      <option value="">-- select --</option>
                      <option value="1">Checkbox</option>
                      <option value="2">Radio</option>
                      <option value="3">Text Field</option>
                      <option value="4">Rating</option>
                      <option value="5">Dropdown</option>
                    </select>
                  </div>
                </MDBCol>
                <MDBCol md={6} className="border-start">
                  <label className="mb-2">Preview</label>
                  <div className="border-start border-4 rounded shadow-sm border-primary p-3">
                    {
                      !questionType ? (
                        <p className="text-center text-muted">Select question answer type first.</p>
                      ) : questionType === '3' ?  (
                        <MDBTextArea disabled rows={4} />
                      ) : questionType === '4' ? (
                        <div className="d-flex gap-3 justify-content-center">
                          {
                            [...Array(5)].map(()=> <span><AiOutlineStar size={30} /></span>)
                          }
                        </div>
                      ) : (
                        <>
                          <div className="py-2 text-center border-top border-bottom border-2 text-muted">
                            Label
                          </div>
                          {
                            labels.length > 0 && labels.map(item=> (
                              <div className="py-3 border-bottom border-1" key={item.id}>
                                <div className="d-flex align-items-center gap-4">
                                  <MDBInput size="sm" type="text" onChange={(e)=>handleLabelEdit(e, item?.id)} />
                                  <span style={{ cursor: "pointer" }} className="fw-bold text-black" onClick={()=>handleLabelDelete(item.id)}>
                                    <AiOutlineClose />
                                  </span>
                                </div>
                              </div>
                            ))
                          }
                          <div className="d-flex justify-content-center mt-3">
                            <MDBBtn type="button"  outline color="dark" size="sm" className="d-flex gap-1 align-items-center" onClick={handleLabelAdd}>
                              <span><AiOutlinePlus size={12} /></span>
                              <span>Add</span>
                            </MDBBtn>
                          </div>
                        </>
                      )
                    }
                  </div>
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
            <MDBCardFooter>
              <div className="d-flex gap-3 justify-content-end">
                <MDBBtn color="primary" type="submit" disabled={modalLoading} >
                  {modalLoading ? (
                      <MDBSpinner color='light' size="sm">
                      <span className='visually-hidden'>Loading...</span>
                    </MDBSpinner>
                    ) : 'Save'
                  }
                </MDBBtn>
                <MDBBtn type="button" disabled={modalLoading} color="secondary" onClick={closeModal}>
                  Cancel
                </MDBBtn>
              </div>
            </MDBCardFooter>
          </MDBCard>
        </div>
      </Modal>
    </>
  );
};

export default EditSurvey;
