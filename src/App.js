import { useEffect, useState } from 'react';
import { onAuthStateChanged2 } from './firebase/firebase';

import { Home } from './components/Home/Home';
import { Login } from './components/Login/Login';

import { Route, Switch, BrowserRouter } from 'react-router-dom'


function App() {
  return <BrowserRouter>
    <Switch>
      <Route Component={Login} path='/login'/>
      <Route Component={Home} path='/'/>

    </Switch>
  </BrowserRouter>



  // var [isLogin,setLogin] =useState(false)

  // useEffect(()=>{
  //   onAuthStateChanged2(async(user)=>{
  //     console.log({user})
  //     console.log(user.email)
  //     if(user) {
  //       setLogin(true);
  //     }
  //   })
  // }, [])


  // if (isLogin === true)
  // {
  //   return (
  //     <Home />
  //   );
  // } else {
  //   return (
  //     <Login />
  //   )
  // }

}

export default App;
