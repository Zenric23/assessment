import { useState } from 'react'
import { MDBBtn, MDBContainer } from 'mdb-react-ui-kit';



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MDBContainer className='mt-5'>
        <MDBBtn>HI</MDBBtn>  
      </MDBContainer>
    </>
  )
}

export default App
