import React, { useContext, useEffect, useState, useRef } from "react";
import {UserContext} from '../../context/userContext'
import { useNavigate, useParams } from "react-router-dom";
import { callCloudFunc, database } from "../../../firebaseConfig";
import { BsTrashFill } from 'react-icons/bs'
import {
  collection,
  documentId,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
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
  import serialize from 'form-serialize'
  import { AiOutlineStar, AiFillStar } from "react-icons/ai";
  

const AnswerSurvey = () => {
  const { id } = useParams();

  const {user} = useContext(UserContext)
  console.log(user)
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false)

  const [userAnswers, setUserAnswers] = useState([])
  const [checkAnswers, setCheckAnswers] = useState([])
  
 

  // handle radio type
  const onRadioOptionChange = (e, answerId, questionId) => {
    const value = e.target.value

    const newArr = userAnswers.map(item=> {
      if(item.questionId === questionId) {
        return {...item, answer: {answerId, value}, radioCheckValId: answerId}
      }
      return item
    })
    setUserAnswers(newArr)
  }

  // handle checkbox type
  const onCheckboxChange = (e, answerId, questionId, index) => {
      const value = e.target.value
      const isChecked = e.target.checked
    
      const newArr = userAnswers.map((item, i)=> {
        if(item.questionId === questionId) { 

          if(isChecked && !checkAnswers.find(item=> item.answerId === answerId)) {
            setCheckAnswers(prev=> [...prev, {questionId, answerId, value}])
          } else {
            setCheckAnswers(checkAnswers.filter(item=> item.answerId !== answerId))
          }

          const updateCheckState = item.checkboxCheck.map((item, i)=> 
            i === index ? !item : item
          )

          return {...item, checkboxCheck: updateCheckState}
        }
        return item
      })
      setUserAnswers(newArr)
  }

  // handle textfield type
  const onTextAreaChange = (e, answerId, questionId) => {
    
    const newState = userAnswers.map(item=> 
      item.questionId === questionId ? {...item, answer: {answerId, value: e.target.value}} : item
    )
    setUserAnswers(newState)
  }

  // handle dropdown type
  const onDropDown = (e, questionId) => {

    const label = e.target[e.target.selectedIndex].innerHTML
    
    const newState = userAnswers.map(item=> 
      item.questionId === questionId ? {...item, answer: {answerId: e.target.value, value: label}} : item
    )
    setUserAnswers(newState)
  }

  // handle rating type

  const onRating = (answer, answerId, questionId) => {
    
    const newState = userAnswers.map(item=> 
        item.questionId === questionId ? {...item, answer: {answerId, value: (answer + 1).toString()}} : item
    )
    setUserAnswers(newState)
  }
  
  
  useEffect(() => {
    // get questions
    const getQuestionAndAnswer = () => {
      setLoading(true)
      const getQuestionsAndAnswers = callCloudFunc("getQuestionsAndAnswers");
      getQuestionsAndAnswers({ id })
        .then((res) => {
          const data = res.data
          setQuestions(data);
          const answers = data.map(item=> {
            return {
              questionId: item.id,
              questionType: item.questionType,
              answer: (item.questionType === '1') ? [] : {} ,
              radioCheckValId: '',
              checkboxCheck: item.questionType === '1' ? new Array(item.labels.length).fill(false) : null,
              dropDownVal: ''
            }
          })
          setUserAnswers(answers)
          setLoading(false)
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    };

    //get survey details
    const getSurveyDetails = () => {
      const collectionRef = collection(database, "survey");
      const q = query(collectionRef, where(documentId(), "==", id));

      onSnapshot(q, (data) => {
        const survey = data.docs.map((item) => {
          return { ...item.data(), id: item.id };
        });
        setTitle(survey[0].title);
        setDesc(survey[0].desc);
      });
    };

    getQuestionAndAnswer();
    getSurveyDetails();
  }, []);

  
  useEffect(()=> {
    // get user survey
    const getUserAnswers = () => {
      setLoading(true)
      const getUserSurveys = callCloudFunc("getUserSurveys");
      getUserSurveys({ id, userId: user.userId })
        .then((res) => {
          console.log(res.data)
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    };

    getUserAnswers()
  }, [])


  const handleSubmit = (e) => {
    e.preventDefault()
    setAddLoading(true)

    // mapped data to submit
    const newArr = userAnswers.map(item=> {
      if(item.questionType === '1') {
        const answers = checkAnswers.map(check=> 
          check.questionId === item.questionId ? {questionId: check.questionId, answerId: check.answerId, value: check.value} : check
        )
        const filterAnswer = answers.filter(ans=> ans.questionId === item.questionId).map(item=> ({answerId: item.answerId, value: item.value}))
        return {...item, answer: filterAnswer}
      }
        return item
    })

    // call cloud function submit survey
    const submitUserSurvey = callCloudFunc('submitUserSurvey');
    submitUserSurvey({answers: newArr, userId: user.userId, surveyId: id})
      .then(() => {
        window.alert('Survey submitted')
        setAddLoading(false)
        window.location.pathname = '/'
      }).catch((error) => {
        console.log(error);
        setAddLoading(false)
        window.alert('Survey failed to submit')
      });
    
  }

  if(loading ) {
    return (
      <div className="text-center mt-5">
        <MDBSpinner color="primary" size="lg" style={{ width: '5rem', height: '5rem' }}>
              <span className='visually-hidden'>Loading...</span>
          </MDBSpinner>
      </div>
    )
  }

  if(!loading && userAnswers.length === 0) {
       return <h5 className="text-muted mt-4 text-center">Getting data...</h5>
  }


  return (

    <form id="surveyForm" onSubmit={handleSubmit}>
      {/* <div className="mb-5 border-bottom border-2 border-primary pb-3">
        <h3 className="mb-0">Take Survey</h3>
      </div> */}
      <MDBCol md={10} className="mx-auto">
        <div>
            <div>
                <div className="py-3 mb-5 border-bottom border-3">
                    <h3 className="mb-0 fw-bold">{title}</h3>
                    <p className="text-muted mb-0 mt-2">{desc}</p>
                </div>
            </div>
            
            <div>
                <div className="d-grid gap-4">
                    {questions.length > 0 &&
                    questions.map((item) => (

                        <div key={item.id}>
                          {
                              item.questionType === "1" ? (
                                  <div className="border-start border-primary border-4 ps-4 py-4">
                                    <div className="d-flex justify-content-between mb-3">
                                      <h5>{item.question}</h5> 
                                    </div>
      
                                    <div>
                                      {item.labels.map((label, i) => (
                                        <MDBCheckbox
                                          key={label.id}
                                          name={`check${item.id}`}
                                          value={label.answer}
                                          id={`check${i}${item.id}`}
                                          label={label.answer}
                                          onChange={(e)=>onCheckboxChange(e, label.id, item.id, i)}
                                          checked={userAnswers.find(item=> item.questionId === label.id)?.checkboxCheck[i]}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ) : item.questionType === '2' ? (
                                    <div className="border-start border-primary border-4 ps-4 py-4">
                                      <div className="d-flex justify-content-between mb-3">
                                        <h5>{item.question}</h5>
                                      </div>
                                      <div>
                                        {item.labels.map((label, i) => (
                                          <MDBRadio
                                            key={label.id}
                                            name={`radio${item.id}`}
                                            id={`radio${i}${item.id}`}
                                            label={label.answer}
                                            value={label.answer}
                                            required
                                            onChange={(e)=>onRadioOptionChange(e, label.id, item.id)}
                                            checked={userAnswers.find(ans=>  ans.radioCheckValId === label.id) ? true : false}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                ) : item.questionType === '3' ? (
                                    <div className="border-start border-primary border-4 ps-4 py-4">
                                      <div className="d-flex justify-content-between mb-3">
                                        <h5>{item.question}</h5>
                                      </div>
                                      <div className="w-100">
                                        <MDBTextArea required name="textarea" row={20} onChange={(e)=>onTextAreaChange(e, item.labels[0].id, item.id)} />
                                      </div>
                                  </div>
                                ) : item.questionType === '4' ? (
                                  <div className="border-start border-primary border-4 ps-4 py-4">
                                    <div className="d-flex justify-content-between mb-3">
                                      <h5>{item.question}</h5>
                                    </div>
                                    <div className="d-flex gap-3">
                                      {[...Array(5)].map((label, i) => {
                                        const rate = userAnswers.find(ans=> ans.questionId === item.id).answer.value || 0
                                        console.log(rate)
                                        return (  
                                          <div key={i}>
                                            {
                                              rate == 0 && (
                                                <span style={{cursor: 'pointer'}} key={i} onClick={()=>onRating(i, item.labels[0].id, item.id)}>
                                                  
                                                  {
                                                    i >= 0 ? <AiOutlineStar size={30} /> : <AiFillStar size={30} />
                                                  }
                                                </span>
                                              ) 
                                              
                                            }
                                             {
                                              rate == 1 && (
                                                <span style={{cursor: 'pointer'}} key={i} onClick={()=>onRating(i, item.labels[0].id, item.id)}>
                                                  
                                                  {
                                                    i >= 1 ? <AiOutlineStar size={30} /> : <AiFillStar size={30} />
                                                  }
                                                </span>
                                              ) 
                                              
                                            }
                                             {
                                              rate == 2 && (
                                                <span style={{cursor: 'pointer'}} key={i} onClick={()=>onRating(i, item.labels[0].id, item.id)}>
                                                  
                                                  {
                                                    i >= 2 ? <AiOutlineStar size={30} /> : <AiFillStar size={30} />
                                                  }
                                                </span>
                                              ) 
                                              
                                            }
                                             {
                                              rate == 3 && (
                                                <span style={{cursor: 'pointer'}} key={i} onClick={()=>onRating(i, item.labels[0].id, item.id)}>
                                                  {
                                                    i >= 3 ? <AiOutlineStar size={30} /> : <AiFillStar size={30} />
                                                  }
                                                </span>
                                              ) 
                                            }
                                             {
                                              rate == 4 && (
                                                <span style={{cursor: 'pointer'}} key={i} onClick={()=>onRating(i, item.labels[0].id, item.id)}>
                                                  {
                                                    i >= 4 ? <AiOutlineStar size={30} /> : <AiFillStar size={30} />
                                                  }
                                                </span>
                                              ) 
                                            }
                                             {
                                              rate == 5 && (
                                                <span style={{cursor: 'pointer'}} key={i} onClick={()=>onRating(i, item.labels[0].id, item.id)}>
                                                  {
                                                    <AiFillStar size={30} />
                                                  }
                                                </span>
                                              ) 
                                            }
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-start border-primary border-4 ps-4 py-4">
                                  <div className="d-flex justify-content-between mb-3">
                                    <h5>{item.question}</h5>
                                  </div>
                                  <select required id="" name="select-name" className="w-100 p-2" onChange={(e)=>onDropDown(e, item.id)}>
                                    <option value="">-- select --</option>
                                    {item.labels.map((label) => (
                                      <option id={label.id} key={label.id} value={label.id} label={label.label}>
                                        {label.answer}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                )
                            }

                        </div>
                    ))}

                   
                </div>
            </div>
            <div>
              <div className="d-flex justify-content-center" style={{paddingBottom: 200, paddingTop: 50}}>
                <MDBBtn type="submit" disabled={addLoading} className="mt-5 w-50 float-end" size="lg">
                  {
                    addLoading ? (
                      <MDBSpinner color="light" size="sm">
                        <span className='visually-hidden'>Loading...</span>
                    </MDBSpinner>
                    ) : 'SUBMIT'
                  }
                </MDBBtn>
              </div>
            </div>
        </div>
      </MDBCol>
    </form>
  );
};

export default AnswerSurvey;
