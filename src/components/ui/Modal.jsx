import React from 'react'
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
  } from 'mdb-react-ui-kit';

const Modal = ({children, title, size, open, setOpen, closeModal, handleSubmit}) => {
  return (
      <MDBModal show={open} setShow={setOpen} tabIndex='-1'>
        <MDBModalDialog size={size}>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{title}</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={closeModal}></MDBBtn>
            </MDBModalHeader>
            <form action="" onSubmit={handleSubmit}>
                {children}
            </form>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
  )
}

export default Modal