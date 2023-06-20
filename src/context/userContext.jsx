import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext("");

function UserProvider({children}) {
    const [user, setUser] = useState(null);
    const [state, setState] = useState('not-registered');

    // useEffect(()=> {
    //   if(localStorage.getItem('isLogin')) {
    //     setUser(localStorage.getItem('isLogin'))
    //   }
    // }, [])
  
    return (
      <UserContext.Provider value={{user, setUser, state, setState}}>
        {children}
      </UserContext.Provider>
    );
  }

  export default UserProvider