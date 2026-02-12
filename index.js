// Check when Start is pressed

document.querySelector('button').addEventListener('click',()=>{
  
  // Load the data into localstorage
  localStorage.setItem("numPeople", document.getElementById('num-people').value);
  localStorage.setItem("time",document.getElementById('time').value)
  console.log( document.getElementById('num-people').value,  document.getElementById('time').value)
  // Load new page
  location.href = 'questions.html'
})