import logo from './logo.svg';
import './App.css';
import { Home } from './Home/Home';
import { Login } from './Login/Login';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from './firebase/firebase';

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
