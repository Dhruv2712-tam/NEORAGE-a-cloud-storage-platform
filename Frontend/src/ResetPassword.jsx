import { useState } from "react"
import { supabase } from "./supabase"
import "./login.css"

export default function ResetPassword(){

const [password,setPassword] = useState("")
const [confirm,setConfirm] = useState("")
const [loading,setLoading] = useState(false)

const updatePassword = async () => {

if(password !== confirm){
alert("Passwords do not match")
return
}

setLoading(true)

const {error} = await supabase.auth.updateUser({
password: password
})

if(error){
alert(error.message)
setLoading(false)
return
}

/* log user out after reset */
await supabase.auth.signOut()

/* redirect to login */
window.location.href = "/"

}

return(

<div className="loginPage">

<div className="loginCard">

<h2 className="title">Set New Password</h2>

<input
className="input"
type="password"
placeholder="New Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<input
className="input"
type="password"
placeholder="Confirm Password"
value={confirm}
onChange={(e)=>setConfirm(e.target.value)}
/>

<button className="mainButton" onClick={updatePassword}>
{loading ? "Updating..." : "Update Password"}
</button>

</div>

</div>

)

}