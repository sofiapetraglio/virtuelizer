const layersContainer = document.getElementById("layers_container");


// scroll datas
let currentLine = 0;
let currentIndex = 0;
let circonferenza = 910.6; // in mm
let circonferenza_duration = 0; // durata in ms di un giro di circonferenza

function startConstruction() {

    dataLoop();
    function dataLoop() {

                lineLoop();
                function lineLoop() {
                    // Check if all lines are finished
                    if (currentLine >= dataList.length) {
                        currentLine = 0; // Reset to the first line
                    } else {
                        // Check if the current line is finished
                        if (currentIndex >= dataList[currentLine].length - 1) {
                            currentLine++; // Move to the next line
                            currentIndex = 0; // Reset the current index for the new line
                        }

                        // Check if the parameter is different than 0 and has to be printed    
                        if (dataList[currentLine][currentIndex] != 0) {

                            // Compose the gcode command for X
                            let current_z = (dataList[currentLine][currentIndex]/100 * circonferenza);
                            console.log("current_z: " + current_z);
                            
                            let gcodeX = "G1 X" + String(current_z) + " Z" + String(current_z - 5.0) + " F1000";
                            console.log(gcodeX);

                            // Send the gcode to the server
                            sendGcode(gcodeX);

                            // Add new layer on the HTML page inside the layerContainer
                            const layerContainer = document.createElement("div");
                            layerContainer.classList.add("layer_container");
                            layersContainer.prepend(layerContainer);

                            // Increment the current data list index for Z
                            currentIndex++;

                            // Continue with Y-axis movement after a timeout
                            // Compose the gcode command for Y
                            let gcodeY = "G1 Y25 Z5 F1000";
                            console.log(gcodeY);

                            // Send the gcode to the server
                            sendGcode(gcodeY);

                            lineLoop();

                        // If parameter is 0 move to the next index
                        } else {
                            currentIndex++;
                            lineLoop();
                    }
                    }
            }

                //console.log("delay: " + dataList[currentLine][dataList[currentLine].length-1]);
            //}, dataList[currentLine][dataList[currentLine].length-1]*1000)+ circonferenza_duration; // Timeout between one line and the other
                }
/*
    // Initialize variables
    let currentLine = 0;
    let currentIndex = 0;
*/
    // Start the data loop
    dataLoop();
    }




function stopConstruction() {

}


// buttons
const buttonStart = document.getElementById("button_start");

buttonStart.addEventListener('click', function startGcode() {
    console.log("Start the construction!");

    startConstruction();
    
});