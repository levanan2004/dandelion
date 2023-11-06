import { signIn } from "../firebase/firebase"
import classes from "./Login.module.css"
export function Login() {
    const onLoginBtnClick = signIn;
    return (

        <>
         <button
         className={classes.button}
          onClick={onLoginBtnClick} type="button" class="google-button">
                Đăng nhập bằng Google
            </button>

            <button type="button" class="google-button">
                Đăng nhập với Facebook
            </button>
        </>

        
           




    )
}