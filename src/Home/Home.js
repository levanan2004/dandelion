import classes from "./Home.module.css"

export function Home() {
    const onLogout = ()=>{
        
    }
    return (<>
            <button 
                className={classes.button}
             onClick={onLogout}>
                Logout
            </button>
            <p>HOME</p>
        </>
    )
}