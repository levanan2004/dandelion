// import { signIn } from "./firebase/firebase"
import { signIn } from "../../firebase/firebase";
import classes from "./Login.module.css"

export function Login() {
    const onLoginBtnClick = signIn;

    return (
        <>
            <button className={classes.button} onClick={onLoginBtnClick} type="button" class="google-button">
                Đăng nhập bằng Google
            </button>

            <button type="button" class="google-button">
                Đăng nhập với Facebook
            </button>

            {/* <div className="login-wrapper" id="login">
                <div className="login-container"> 
                    <h1>Đăng nhập</h1> 
                    <p style={{margin: "20px 0"}}>Đăng nhập vào Dandelion sử dụng Google hoặc Facebook</p>
                    <form className="form">
                        <label htmlFor="email">Email or Phone</label>
                        <input type="email-phone" id="email" placeholder="Email / Số điện thoại" />

                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Mật khẩu" />

                        <a href="#">Bấm vào đây nếu bạn quên mật khẩu?</a>
                        <button className="sign-in" type="submit">Đăng nhập</button>
                    </form>

                    <div className="centered">
                        <p className="line">or</p>
                    </div>

                    <div className="social-container">
                        <button type="button" className="google-button">
                            <img src="./wwwroot/images/signin/google-18px.svg" className="google-icon" />
                            Đăng nhập bằng Google
                        </button>

                        <button type="button" className="google-button">
                            <img src="./wwwroot/images/signin/facebook-18px.svg" className="google-icon" />
                            Đăng nhập với Facebook
                        </button>
                    </div>

                    <div className="centered">
                        <p className="sign-up">Tạo mới tài khoản Dandelion? <a href="">Join now</a></p>
                    </div>

                </div>
            </div> */}
        </>

        
           




    )
}