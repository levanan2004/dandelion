import { useEffect, useState } from 'react';
import { onAuthStateChanged } from './firebase/firebase';

import { Home } from './components/Home/Home';
import { Login } from './Login/Login';


function App() { 
  var [isLogin,setLogin] =useState(false)

  useEffect(()=>{
    onAuthStateChanged(async(user)=>{
      console.log({user})
      console.log(user.email)
      if(user) {
        setLogin(true);
      }
    })
  }, [])


  if (isLogin === true)
  {
    return (
      <Home></Home>
    );
  } else {
    return (
      <Login></Login>
    )
  }

}

export default App;
