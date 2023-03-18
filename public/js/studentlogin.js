function validate() {
  let usn = document.getElementById("usn").value;
  let changeStyle = document.querySelector(".loginerror");
  let pattern = /1BM\d\d[A-Z][A-Z]\d\d\d/g;
  if (!pattern.test(usn) && usn.length != 0) {
    changeStyle.style.display = "inline";
  } else {
    changeStyle.style.display = "none";
  }
}
function hide() {
  let changeStyle = document.querySelector(".loginerror");
  changeStyle.style.display = "none";
}
function check() {
  let password = document.querySelector("#password").value;
  let disButton = document.querySelector(".disabledbutton");
  let buttonColour = document.querySelector(".button");
  let usn = document.getElementById("usn").value;
  let changeStyle = document.querySelector(".loginerror");
  let pattern = /1BM\d\d[A-Z][A-Z]\d\d\d/g;
  if (pattern.test(usn) && usn.length != 0 && password.length >= 8) {
    disButton.style.pointerEvents = "auto";
    buttonColour.style.backgroundColor = "rgb(65, 179, 235)";
  } else {
    disButton.style.pointerEvents = "none";
    buttonColour.style.backgroundColor = "rgb(117, 203, 246)";
  }
}
