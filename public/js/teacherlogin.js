function check() {
  let password = document.querySelector("#password").value;
  let disButton = document.querySelector(".disabledbutton");
  let buttonColour = document.querySelector(".button");
  if (password.length >= 8) {
    disButton.style.pointerEvents = "auto";
    buttonColour.style.backgroundColor = "rgb(65, 179, 235)";
  } else {
    disButton.style.pointerEvents = "none";
    buttonColour.style.backgroundColor = "rgb(117, 203, 246)";
  }
}
