import logo from './logo.svg';
import './App.css';
import { Home } from './Home/Home';
import { Login } from './Login/Login';
import { useEffect, useState } from 'react';
import { onAuthStateChanged2 } from './firebase/firebase';

function App() { 
  var [isLogin,setLogin] =useState(false)

  useEffect(()=>{
    onAuthStateChanged2(async(user)=>{
      console.log({user})
      console.log(user.email)
      if(user) {
        setLogin(true);
      }
    })
  }, [])
  console.log({isLogin})
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
