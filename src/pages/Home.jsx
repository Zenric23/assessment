import { MDBCol, MDBRow, MDBSpinner } from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { RiSurveyFill } from "react-icons/ri";
import { callCloudFunc } from "../../firebaseConfig";

const Home = () => {
  const [loading, setLoading] = useState(false)
  const [stat, setStat] = useState({})

  useEffect(()=> {
    const getStatFunc = () => {
      setLoading(true)
      const getStats = callCloudFunc("getStats");
      getStats()
        .then((res) => {
          setStat(res.data)
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    }
    getStatFunc()
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
        <h3 className="mb-0">Dashboard</h3>
      </div>
      <MDBRow className="g-3">
        <MDBCol md={3}>
          <div className="d-flex border border-2 p-3 rounded">
            <div>
              <div className="bg-primary text-white p-2 rounded">
                <FaUsers size={30} />
              </div>
            </div>
            <div className="ms-3">
              <p className="mb-0">Total User</p>
              <p className="mb-0 fw-bold">{stat?.totalUsers}</p>
            </div>
          </div>
        </MDBCol>
        <MDBCol md={3}>
          <div className="d-flex border border-2 p-3 rounded">
            <div>
              <div className="bg-success text-white p-2 rounded">
                <RiSurveyFill size={30} />
              </div>
            </div>
            <div className="ms-3">
              <p className="mb-0">Total Survey</p>
              <p className="mb-0 fw-bold">{stat?.totalSurveys}</p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </>
  );
};

export default Home;
