import { useState } from "react"
import { supabase } from "./supabase"
import "./login.css"

export default function Login(){

const [email,setEmail]=useState("")
const [password,setPassword]=useState("")
const [tab,setTab]=useState("login")

const login=async()=>{

const {error}=await supabase.auth.signInWithPassword({
email,
password
})

if(error) alert(error.message)

}

const signup=async()=>{

const {error}=await supabase.auth.signUp({
email,
password
})

if(error) alert(error.message)

}

const forgotPassword=async()=>{

if(!email){
alert("Enter your email first")
return
}

const {error}=await supabase.auth.resetPasswordForEmail(email,{
redirectTo:window.location.origin
})

if(error){
alert(error.message)
}else{
alert("Password reset email sent")
}

}

return(

<div className="loginPage">

<div className="floatingShape shape1"></div>
<div className="floatingShape shape2"></div>
<div className="floatingShape shape3"></div>

<div className="topBar">

<div className="siteLogo">
NEORAGE
</div>

<button
className="navButton"
onClick={()=>setTab(tab==="about"?"login":"about")}
>
{tab==="about"?"Login":"About"}
</button>

</div>


{/* LOGIN TAB */}

{tab==="login" && (

<div className="loginCard">

<h2 className="title">Welcome Back</h2>

<input
className="input"
type="email"
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
/>

<input
className="input"
type="password"
placeholder="Password"
value={password}
onChange={e=>setPassword(e.target.value)}
/>

<div className="buttons">

<button className="mainButton" onClick={login}>
Login
</button>

</div>

<div style={{textAlign:"center",marginTop:"5px"}}>

<span
onClick={forgotPassword}
style={{
color:"white",
cursor:"pointer",
fontSize:"14px",
opacity:"0.8"
}}
>
Forgot Password?
</span>

</div>

<div className="buttons">

<button className="mainButton" onClick={signup}>
Sign Up
</button>

</div>

</div>

)}



{/* ABOUT TAB */}

{tab==="about" && (

<div>

<div className="aboutCard" style={{top:"120px",padding:"40px"}}>

<h2 className="title">About NEORAGE</h2>

<p style={{color:"white",lineHeight:"1.6"}}>

NEORAGE is a cloud storage platform designed to allow users
to upload, organize and manage files through a clean and
modern interface. Users can create folders and store files
securely while accessing them easily through the web.

This project demonstrates how a full-stack cloud storage
system can be built using React for the frontend,
Java Spring Boot for backend APIs, and Supabase storage
which uses an S3 bucket service to store and manage files.

</p>

</div>



<div className="aboutCard" style={{top:"360px",padding:"40px"}}>

<h2 className="title">About the Developer</h2>

<p style={{color:"white",lineHeight:"1.6"}}>

My name is Dhruv Tripathi and I am currently a student at
BMS Institute of Technology and Management studying
Electronics and Communication Engineering (ECE).

I built this cloud storage system using React for the
frontend and Java Spring Boot for the backend. The system
stores uploaded files using Supabase storage which operates
on an S3 bucket service.

This project helped me understand how modern web
applications integrate frontend interfaces, backend APIs
and cloud storage together to create a complete real-world
software system.

</p>

</div>



{/* EMAIL */}

<div style={{
position:"absolute",
bottom:"20px",
left:"40px",
color:"white",
opacity:"0.8",
fontSize:"14px"
}}>

dhruvtripathi1141@gmail.com

</div>



{/* DATE */}

<div style={{
position:"absolute",
bottom:"20px",
right:"40px",
color:"white",
opacity:"0.8",
fontSize:"14px"
}}>

23 March 2026

</div>

</div>

)}

</div>

)

}