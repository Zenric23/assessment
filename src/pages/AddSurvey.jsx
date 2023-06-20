import { MDBBtn, MDBCard, MDBCol, MDBInput, MDBSpinner } from 'mdb-react-ui-kit'
import React, { useState } from 'react'
import { callCloudFunc } from '../../firebaseConfig'
import { useNavigate } from 'react-router-dom'

const AddSurvey = () => {

  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)


  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    const addSurvey = callCloudFunc('addSurvey');
    addSurvey({title, desc})
      .then(() => {
        navigate('/survey')
        window.alert('survey added successfully.')
      }).catch((error) => {
        console.log(error);
        setLoading(false)
        window.alert('survey failed to add.')
      });
  }


  return (
    <>
       <div className="mb-5 border-bottom border-2 border-primary pb-3">
        <h3 className="mb-0">Add Survey</h3>
      </div>
      <MDBCol md={6}>
        <MDBCard className='p-4 border'>
          <form onSubmit={handleSubmit} action="">
            <div className='mb-3'>
              <label htmlFor="" className='mb-2'>Title</label>
              <MDBInput type='text' onChange={(e)=>setTitle(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="" className='mb-2'>Description</label>
              <MDBInput type='text' onChange={(e)=>setDesc(e.target.value)} required />
            </div>
            <MDBBtn type='submit' className='mt-4 float-end' disabled={loading}>
              {
                loading ? (
                  <MDBSpinner color='light' size="sm">
                  <span className='visually-hidden'>Loading...</span>
                </MDBSpinner>
                ) : 'Save'
              }
            </MDBBtn>
          </form>
        </MDBCard>
      </MDBCol>
    </>
  )
}

export default AddSurvey