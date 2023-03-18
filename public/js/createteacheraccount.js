function validatePassword() {
  let password = document.querySelector("#password").value;
  let changeStyle = document.querySelector(".password");
  let ctr = 0;
  if (password.length > 7) {
    ctr++;
  }
  let reg1 = /\d/g;
  if (reg1.test(password)) {
    ctr++;
  }
  let reg2 = /[A-Z]/g;
  if (reg2.test(password)) {
    ctr++;
  }
  let reg3 = /[!@#$%^&*?]/g;
  if (reg3.test(password)) {
    ctr++;
  }
  if (ctr != 4) {
    changeStyle.style.display = "inline";
  } else {
    changeStyle.style.display = "none";
    let disButton = document.querySelector(".disabledbutton");
    if (validateEmail() && validatePhone()) {
      disButton.style.cursor = "pointer";
      disButton.style.pointerEvents = "auto";

      disButton.style.backgroundColor = "rgb(65, 179, 235)";
    } else {
      disButton.style.pointerEvents = "none";
      buttonColour.style.backgroundColor = "rgb(117, 203, 246)";
    }
  }
}

function validatePhone() {
  let phoneNo = document.querySelector("#phoneno").value;
  let pattern = /\d{10}/;
  let changeStyle = document.querySelector(".phone");
  if (!pattern.test(phoneNo) && phoneNo.length != 0) {
    changeStyle.style.display = "inline";
  } else {
    changeStyle.style.display = "none";
    return 1;
  }
}

function hidePhone() {
  let changeStyle = document.querySelector(".phone");
  changeStyle.style.display = "none";
}

function validateEmail() {
  let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let email = document.querySelector("#email").value;
  let changeStyle = document.querySelector(".email");
  if (!pattern.test(email) && email.length != 0) {
    changeStyle.style.display = "inline";
  } else {
    changeStyle.style.display = "none";
    return 1;
  }
}
function hideEmail() {
  let changeStyle = document.querySelector(".email");
  changeStyle.style.display = "none";
}

function unlockButton() {}
