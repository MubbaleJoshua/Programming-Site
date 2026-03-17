function toggleMode(){
document.body.classList.toggle("dark")
}

function runCode(){
let code=document.getElementById("code").value
document.getElementById("output").srcdoc=code
}