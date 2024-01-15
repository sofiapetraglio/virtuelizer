const layersContainer = document.getElementById("layers_container");


// scroll datas
let currentLine = 0;

function startConstruction() {
    function dataLoop() {
        setTimeout(() => {
            // Compose the gcode command for X
            let gcodeX = "G1 X-" + (dataList[currentLine][0]*10) + " Z-10 F5000";
            console.log(gcodeX);

            // Send the gcode to the server
            sendGcode(gcodeX);

            // Add new layer on the HTML page inside the layerContainer
            const layerContainer = document.createElement("div");
            layerContainer.classList.add("layer_container");
            layersContainer.prepend(layerContainer);

            /*
            // Increment the current data list line
            currentLine++;      
            */

            // Check if the list is finished
            if (currentLine > dataList.length - 1) {
                currentLine = 0; // Reset the current line
            } else {
                // Continue with Y-axis movement after a timeout
                setTimeout(() => {
                    // Compose the gcode command for Y
                    let gocodeZ = "G1 Z0";
                    let gcodeY = "G1 Y10 F2000";
                    console.log(gcodeY);

                    // Send the gcode to the server
                    sendGcode(gcodeY);

                    // Increment the current data list line
                    currentLine++;

                    // Check if the list is finished
                    if (currentLine > dataList.length - 1) {
                        currentLine = 0; // Reset the current line
                    } else {
                        // Continue the data loop
                        dataLoop();
                    }
                }, 1000); // Timeout for Y-axis movement
            }
        }, 1000); // Timeout for X-axis movement
    }

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