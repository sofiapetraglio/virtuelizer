const layersContainer = document.getElementById("layers_container");


// scroll datas
let currentLine = 0;
let currentIndex = 0;
let circonferenza = 910.6; // in mm

function startConstruction() {
    function dataLoop() {
        setTimeout(() => {
            // Check if the current line is finished
            if (currentIndex >= dataList[currentLine].length - 1) {
                // Move to the next line
                currentLine++;
                currentIndex = 0; // Reset the current index for the new line
            }

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

            // Check if the list is finished
            if (currentLine > dataList.length - 1) {
                currentLine = 0; // Reset the current line
            } else {
                // Continue with Y-axis movement after a timeout
                setTimeout(() => {
                    // Compose the gcode command for Y
                    let gcodeY = "G1 Y25 Z5 F1000";
                    console.log(gcodeY);

                    // Send the gcode to the server
                    sendGcode(gcodeY);

                    // Continue the data loop
                    dataLoop();
                }, 1000); // Timeout for Y-axis movement
            }
        //}, dataList[currentLine][dataList[currentLine].length-1]*1000); // Timeout for X-axis movement
         }, 10000); // Timeout for X-axis movement
    }

    // Initialize variables
    let currentLine = 0;
    let currentIndex = 0;

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