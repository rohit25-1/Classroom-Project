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
function validatePassword() {
  let password = document.querySelector("#password").value;
  let len = document.querySelector(".length");
  let special = document.querySelector(".special");
  let upper = document.querySelector(".upper");
  let numb = document.querySelector(".number");
  let ctr = 0;
  if (password.length > 7) {
    len.style.color = "#38d61c";
    ctr++;
  } else {
    len.style.color = "rgb(194, 54, 54)";
  }
  let reg1 = /\d/g;
  if (reg1.test(password)) {
    numb.style.color = "#38d61c";
    ctr++;
  } else {
    numb.style.color = "rgb(194, 54, 54)";
  }
  let reg2 = /[A-Z]/g;
  if (reg2.test(password)) {
    upper.style.color = "#38d61c";
    ctr++;
  } else {
    upper.style.color = "rgb(194, 54, 54)";
  }
  let reg3 = /[!@#$%^&*?]/g;
  if (reg3.test(password)) {
    special.style.color = "#38d61c";
    ctr++;
  } else {
    special.style.color = "rgb(194, 54, 54)";
  }
  if (ctr == 4) {
    len.style.display = "none";
    numb.style.display = "none";
    upper.style.display = "none";
    special.style.display = "none";
    return 1;
  } else {
    len.style.display = "block";
    numb.style.display = "block";
    upper.style.display = "block";
    special.style.display = "block";
  }
}

function passwordMatch() {
  let password1 = document.querySelector("#password").value;
  let password2 = document.querySelector("#passwordAgain").value;
  let changeStyle1 = document.querySelector(".passwordmatch");
  if (password1 !== password2) {
    changeStyle1.style.display = "block";
  } else {
    changeStyle1.style.display = "none";
  }
  let password = document.querySelector("#password").value;
  let disButton = document.querySelector(".disabledbutton");
  let buttonColour = document.querySelector(".button");
  let usn = document.getElementById("usn").value;
  let changeStyle = document.querySelector(".loginerror");
  let pattern = /1BM\d\d[A-Z][A-Z]\d\d\d/g;
  if (password.length >= 8 && password1 === password2) {
    disButton.style.pointerEvents = "auto";
    buttonColour.style.backgroundColor = "rgb(65, 179, 235)";
  } else {
    disButton.style.pointerEvents = "none";
    buttonColour.style.backgroundColor = "rgb(117, 203, 246)";
  }
}
