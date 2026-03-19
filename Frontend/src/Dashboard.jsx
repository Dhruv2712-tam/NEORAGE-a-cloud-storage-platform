import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"
import "./ui.css"

function Dashboard(){

const [files,setFiles]=useState([])
const [folders,setFolders]=useState([])
const [folder,setFolder]=useState(null)

const [selectedFolders,setSelectedFolders]=useState([])
const [selectedFiles,setSelectedFiles]=useState([])

const [user,setUser]=useState("")
const [search,setSearch]=useState("")
const [menu,setMenu]=useState(null)

const [uploadOpen,setUploadOpen]=useState(false)
const [pendingFiles,setPendingFiles]=useState([])

const fileInput=useRef()

function formatSize(bytes){

if(!bytes) return "-"

const units=["B","KB","MB","GB","TB"]
let i=0

while(bytes>=1024 && i<units.length-1){
bytes/=1024
i++
}

return bytes.toFixed(2)+" "+units[i]

}

useEffect(()=>{ loadUser() },[])

/* close menu when clicking outside */

useEffect(()=>{

const closeMenu=(e)=>{

if(
!e.target.closest(".dropdown") &&
!e.target.closest(".menuButton")
){
setMenu(null)
}

}

window.addEventListener("click",closeMenu)

return()=>window.removeEventListener("click",closeMenu)

},[])

const loadUser=async()=>{

const {data}=await supabase.auth.getUser()

if(data.user){
setUser(data.user.email)
fetchFiles(data.user.email)
}

}

const fetchFiles=async(email)=>{

const res=await fetch(`http://localhost:8080/files?userId=${email}`)
const data=await res.json()

setFiles(data)

const folderSet=new Set()

data.forEach(f=>{
if(f.folder) folderSet.add(f.folder)
})

setFolders(Array.from(folderSet))

}

const browse=()=> fileInput.current.click()

const handleDrop=(e)=>{
e.preventDefault()
const dropped=Array.from(e.dataTransfer.files)
setPendingFiles(prev=>[...prev,...dropped])
}

const uploadFiles=async()=>{

for(let file of pendingFiles){

const form=new FormData()

form.append("file",file)
form.append("userId",user)
form.append("folder",folder)

await fetch("http://localhost:8080/upload",{
method:"POST",
body:form
})

}

setPendingFiles([])
setUploadOpen(false)

fetchFiles(user)

}

const createFolder=()=>{

const name=prompt("Folder name")

if(!name) return
if(folders.includes(name)) return

setFolders([...folders,name])

}

const deleteFolders=async()=>{

for(let f of selectedFolders){

const folderFiles=files.filter(x=>x.folder===f)

for(let file of folderFiles){

await fetch(`http://localhost:8080/delete?fileName=${file.file_name}&userId=${user}&folder=${f}`,{
method:"DELETE"
})

}

}

setSelectedFolders([])
fetchFiles(user)

}

const deleteFiles=async(list)=>{

for(let f of list){

await fetch(`http://localhost:8080/delete?fileName=${f}&userId=${user}&folder=${folder}`,{
method:"DELETE"
})

}

setSelectedFiles([])
fetchFiles(user)

}

const shareFile=(url)=>{
navigator.clipboard.writeText(url)
alert("Link copied")
}

const toggleFolder=(name)=>{

if(selectedFolders.includes(name)){
setSelectedFolders(selectedFolders.filter(f=>f!==name))
}else{
setSelectedFolders([...selectedFolders,name])
}

}

const toggleFile=(name)=>{

if(selectedFiles.includes(name)){
setSelectedFiles(selectedFiles.filter(f=>f!==name))
}else{
setSelectedFiles([...selectedFiles,name])
}

}

const visibleFiles=files
.filter(f=>f.folder===folder)
.filter(f=>f.file_name.toLowerCase().includes(search.toLowerCase()))

const visibleFolders = folders.filter(f =>
f.toLowerCase().includes(search.toLowerCase())
)

const logout=async()=>{
await supabase.auth.signOut()
window.location.reload()
}

return(

<div className="layout">

<div className="sidebar">

<div className="brand">NEORAGE</div>

<div className="navSection">
<div className="navItem active">Home</div>
</div>

</div>

<div className="main">

<div style={{display:"flex",alignItems:"center",marginBottom:"25px"}}>

<input
className="search"
placeholder="Search in NEORAGE"
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{width:"420px",marginRight:"30px"}}
/>

<button
className="logoutButton"
onClick={logout}
style={{marginLeft:"auto"}}
>
Logout
</button>

</div>

<div style={{display:"flex",alignItems:"center",marginBottom:"25px"}}>

<div style={{display:"flex",gap:"12px"}}>

{!folder && (
<button className="newButton" onClick={createFolder}>
New Folder
</button>
)}

{folder && (
<button className="newButton" onClick={()=>setUploadOpen(true)}>
Upload
</button>
)}

</div>

<div style={{marginLeft:"auto",display:"flex",gap:"12px"}}>

{selectedFolders.length>0 && !folder && (
<button className="newButton" onClick={deleteFolders}>
Delete
</button>
)}

{selectedFiles.length>0 && folder && (
<button className="newButton" onClick={()=>deleteFiles(selectedFiles)}>
Delete
</button>
)}

</div>

<input
type="file"
multiple
ref={fileInput}
style={{display:"none"}}
onChange={(e)=>{
const selected=Array.from(e.target.files)
setPendingFiles(prev=>[...prev,...selected])
}}
/>

</div>

{!folder && (

<div className="fileTable">

<div className="tableHeader">
<div>Name</div>
<div>Size</div>
<div>Date</div>
<div></div>
</div>

<div className="fileBody">

{visibleFolders.map(f=>{

const folderFiles=files.filter(x=>x.folder===f)

const totalSize=folderFiles.reduce((sum,x)=>sum+(x.file_size||0),0)

const latest=folderFiles.length
? new Date(Math.max(...folderFiles.map(x=>new Date(x.created_at||0)))).toLocaleString()
: "-"

return(

<div className="fileRow" key={f} onClick={()=>setFolder(f)} style={{cursor:"pointer"}}>

<div className="fileName">

<input
type="checkbox"
checked={selectedFolders.includes(f)}
onClick={(e)=>e.stopPropagation()}
onChange={()=>toggleFolder(f)}
style={{marginRight:"10px"}}
/>

📁 {f}

</div>

<div>{formatSize(totalSize)}</div>
<div>{latest}</div>
<div></div>

</div>

)

})}

</div>

</div>

)}

{folder && (

<div className="fileTable">

<div className="tableHeader">

<div>Name</div>
<div>Size</div>
<div>Date</div>

<button
className="logoutButton"
onClick={()=>setFolder(null)}
>
Back
</button>

</div>

<div className="fileBody">

{visibleFiles.map(file=>(

<div className="fileRow" key={file.id}>

<div className="fileName">

<input
type="checkbox"
checked={selectedFiles.includes(file.file_name)}
onChange={()=>toggleFile(file.file_name)}
style={{marginRight:"10px"}}
/>

{file.file_name}

</div>

<div>{formatSize(file.file_size)}</div>

<div>
{file.created_at
? new Date(file.created_at).toLocaleString()
: "-"}
</div>

<div className="menuArea">

<button
className="menuButton"
onClick={(e)=>{

e.stopPropagation()

const rect = e.currentTarget.getBoundingClientRect()
const dropdownHeight = 110

if(rect.bottom + dropdownHeight > window.innerHeight){
e.currentTarget.parentElement.classList.add("menu-up")
}else{
e.currentTarget.parentElement.classList.remove("menu-up")
}

setMenu(menu===file.id?null:file.id)

}}
>
⋮
</button>

{menu===file.id && (

<div className="dropdown">

<div onClick={()=>window.open(file.file_url)}>
Download
</div>

<div onClick={()=>deleteFiles([file.file_name])}>
Delete
</div>

<div onClick={()=>shareFile(file.file_url)}>
Share
</div>

</div>

)}

</div>

</div>

))}

</div>

</div>

)}

{uploadOpen && (

<div className="uploadOverlay" onClick={()=>setUploadOpen(false)}>

<div
className="uploadBox"
onClick={(e)=>e.stopPropagation()}
onDrop={handleDrop}
onDragOver={(e)=>e.preventDefault()}
>

<div className="uploadIcon">📂</div>

<div className="uploadText">
Drag files here or
<span className="uploadLink" onClick={browse}> browse</span>
</div>

<div className="uploadList">

{pendingFiles.map((f,i)=>(

<div key={i} className="uploadItem">

<span>{f.name}</span>

<button
className="removeUpload"
onClick={()=>setPendingFiles(pendingFiles.filter((_,index)=>index!==i))}
>
✕
</button>

</div>

))}

</div>

{pendingFiles.length>0 && (

<button
className="newButton"
style={{marginTop:"15px"}}
onClick={uploadFiles}
>
Upload
</button>

)}

</div>

</div>

)}

</div>

</div>

)

}

export default Dashboard