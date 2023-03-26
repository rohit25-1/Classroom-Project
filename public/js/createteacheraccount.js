// function validatePassword() {
//   let password = document.querySelector("#password").value;
//   let changeStyle = document.querySelector(".password");
//   let ctr = 0;
//   if (password.length > 7) {
//     ctr++;
//   }
//   let reg1 = /\d/g;
//   if (reg1.test(password)) {
//     ctr++;
//   }
//   let reg2 = /[A-Z]/g;
//   if (reg2.test(password)) {
//     ctr++;
//   }
//   let reg3 = /[!@#$%^&*?]/g;
//   if (reg3.test(password)) {
//     ctr++;
//   }
//   if (ctr != 4) {
//     changeStyle.style.display = "inline";
//   } else {
//     changeStyle.style.display = "none";
//     let disButton = document.querySelector(".disabledbutton");
//     if (validateEmail() && validatePhone()) {
//       disButton.style.cursor = "pointer";
//       disButton.style.pointerEvents = "auto";

//       disButton.style.backgroundColor = "rgb(65, 179, 235)";
//     } else {
//       disButton.style.pointerEvents = "none";
//       buttonColour.style.backgroundColor = "rgb(117, 203, 246)";
//     }
//   }
// }

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
    len.style.color = "rgb(194, 54,54)";
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
    let disButton = document.querySelector(".disabledbutton");
    if (validateEmail() && validatePhone()) {
      disButton.style.cursor = "pointer";
      disButton.style.pointerEvents = "auto";
      disButton.style.backgroundColor = "rgb(65, 179, 235)";
    } else {
      disButton.style.pointerEvents = "none";
      buttonColour.style.backgroundColor = "rgb(117, 203, 246)";
    }
    return 1;
  } else {
    len.style.display = "block";
    numb.style.display = "block";
    upper.style.display = "block";
    special.style.display = "block";
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

function fileUpload() {
  const clicker = document.querySelector(".upload");
  clicker.click();
}
