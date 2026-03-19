import { useEffect, useState } from "react"
import Login from "./Login"
import Dashboard from "./Dashboard"
import ResetPassword from "./ResetPassword"
import { supabase } from "./supabase"

export default function App(){

const [session,setSession] = useState(null)
const [recoveryMode,setRecoveryMode] = useState(false)

useEffect(()=>{

supabase.auth.getSession().then(({data})=>{
setSession(data.session)
})

const { data: listener } = supabase.auth.onAuthStateChange((event,session)=>{

if(event === "PASSWORD_RECOVERY"){
setRecoveryMode(true)
}

setSession(session)

})

return ()=> listener.subscription.unsubscribe()

},[])

if(recoveryMode){
return <ResetPassword/>
}

if(session){
return <Dashboard/>
}

return <Login/>

}