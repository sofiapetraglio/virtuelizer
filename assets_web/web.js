const layersContainer = document.getElementById("layers_container");


// scroll datas
let currentLine = 0;
let currentIndex = 0;
let circonferenza = 910.6; // in mm
let circonferenza_duration = 0; // durata in ms di un giro di circonferenza


function lineLoop() {
    
    /*
    // Check if all lines are finished
    if (currentLine >= dataList.length) {
        //currentLine = 0; // Reset to the first line
    } else {
    */

    if (currentIndex >= dataList[currentLine].length - 1) {
        stopLine();
    }
    else {

        console.log('currentIndex: ' + currentIndex + ', current value: ' + dataList[currentLine][currentIndex]);

        // Check if the parameter is different than 0 and has to be printed    
        if (dataList[currentLine][currentIndex] != 0) {

            // Compose the gcode command for X
            let current_z = (dataList[currentLine][currentIndex]/100 * circonferenza);
            // console.log("current_z: " + current_z);
            
            let gcodeX = "G1 X" + String(current_z) + " Z" + String(current_z - 5.0) + " F1000";
            console.log(gcodeX);

            // Send the gcode to the server
            sendGcode(gcodeX);

            // Add new layer on the HTML page inside the layerContainer
            const layerContainer = document.createElement("div");
            layerContainer.classList.add("layer_container");
            layersContainer.prepend(layerContainer);

            // Continue with Y-axis movement after a timeout
            // Compose the gcode command for Y
            let gcodeY = "G1 Y25 Z5 F1000";
            console.log(gcodeY);

            // Send the gcode to the server
            sendGcode(gcodeY);

            // Increment the current data list index for Z
            currentIndex++;

            lineLoop();

        // If parameter is 0 move to the next index
        } else {
            currentIndex++;
            lineLoop();
        }
    }
}

function stopLine() {
    // Choose random new start if line is finished
    console.log('> Stop Line! <');
    let current_z = (Math.floor((Math.random()) * circonferenza));
    // console.log("line completed");
    // console.log("random_z: " + current_z);
    
    let gcodeZ = "G1 Z" + String(current_z) + " F1000";
    console.log('Random Z advancement: ' + gcodeZ);
    
    // Move to the next job
    if(currentLine == dataList.length - 1) {
        console.log('\n\n>>>> Print finisched! <<<<<\n\n');
        currentLine = 0;
    }
    else {
        currentLine++; // Move to the next line
    }
    currentIndex = 0; // Reset the current index for the new line

    console.log('\n\n');

}

function startLine() {
    console.log('>>>> Start new line: ' + currentLine + ' <<<<< \n');
    lineLoop();
}


// buttons
const buttonStart = document.getElementById("button_start");

buttonStart.addEventListener('click', function startGcode() {
    startLine();
});


document.addEventListener('keypress', (event) => {
    //const verseIndex = Math.floor((key - 1) / 3);
    //const lineIndex = (key - 1) % 3;
    console.log('key pressed: ' + event.key);
    console.log('\n');

    switch (event.key) {
        case 's':
            startLine();
            break;
        case 'r':
            // send reset Gcode....
            break;
    }
});
