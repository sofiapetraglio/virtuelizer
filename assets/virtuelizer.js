let parameters = [
    [420, 9176],
    [700, 809],
    [630, 6337],
    [150, 644],
    [450, 9938],
    [90, 4103],
    [730, 2818],
    [70, 501],
    [80, 3819],
    [390, 8096],
    [300, 5215],
    [600, 6259],

];


let i = 0;

function readParameters() {
  function myLoop() {
    let parameterCode = "G1 X" + parameters[i][0] + " F1000";
    console.log(parameterCode);

    setTimeout(function () {
      console.log("Wait " + parameters[i][1] + " milliseconds");
      i++;

      if (i < parameters.length) {
        myLoop();
      }
    }, parameters[i][1]);
  }

  myLoop();
}

readParameters();





