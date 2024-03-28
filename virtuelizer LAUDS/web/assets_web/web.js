const layersContainer = document.getElementById("layers_container");
const canvas = document.getElementById("canvas");

// scroll datas
let currentIndex = 0;
let circonferenza = 910.6; // in mm
let circonferenza_duration = 0; // durata in ms di un giro di circonferenza

// datas for the printing of the line
let dataList = null;


function updateDataList(data) {
    console.log('Interface: ' + data);
    dataList = data.split(',');
    console.log('Interface: ' + data);

    startLine();    // draw the lines
}


function lineLoop() {
    
    // If line IS finishe
    if (currentIndex >= dataList.length) {
        stopLine();
    }
    else { // If line IS NOT finished

        console.log('currentIndex: ' + currentIndex + ', current value: ' + dataList[currentIndex]);

        // Check if the parameter is different than 0 and has to be printed    
        if (dataList[currentIndex] != 0) {

            // Compose the gcode command for X
            let current_z = (dataList[currentIndex]/100 * circonferenza);
            // console.log("current_z: " + current_z);
            
            let gcodeX = "G1 X" + String(current_z - 10.0)/2 + " Z" + String(current_z - 10.0) + " F1000";
            console.log(gcodeX);

            // Send the gcode to the server
            sendGcode(gcodeX);


            // Compose the gcode command for Y
            let gcodeY = "G1 Y50 Z10 F4000";
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

    // Send the gcode to the server
    sendGcode(gcodeZ); // CHECK IF IT WORKS OR REMOVE

    console.log('\n\n');

    currentIndex = 0;
}

function startLine() {
    console.log('>>>> Start the new line <<<<< \n');
    draw();
    lineLoop();
}


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


function draw() {
    const canvas = document.getElementById('canvas');
    const width = canvas.width / 2;
    const height = canvas.height/2;
    const radius = width + 500;

    // animation angle increment
    let screen_framerate = 30;
    let time_line_print = 26;
    let angle_increment = Math.PI / (screen_framerate * time_line_print);

    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');
        const line_width = 250;

        ctx.lineWidth = line_width;
        ctx.lineCap = 'round';

        // Initial angle for animation
        let angle = 0;

        // Gap between percentages
        const gapAngle = 0.05;

        // Spacing between text along the arch
        const textSpacing = 60; // Adjust this value to change the spacing between text

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw all arches at the same time with animation and gap
            let initial_start_angle = Math.PI / 4.5;
            let startAngle = initial_start_angle;

            let total_segment_angle = Math.PI * 2 - dataList.length * gapAngle;

            for (let i = 0; i < dataList.length; i++) {
                if (dataList[i] != 0) {
                    const endAngle = startAngle - (dataList[i] / 100) * total_segment_angle;

                    // Color conditions
                    let color;
                    let textValue;
                    switch (i) {
                        case 0:
                            color = 'rgb(186, 71, 71)'; // local
                            textValue = 'local';
                            break;
                        case 1:
                            color = 'rgb(71, 166, 186)'; // accessible
                            textValue = 'accessible';
                            break;
                        case 2:
                            color = 'rgb(94, 186, 71)'; // urban
                            textValue = 'urban';
                            break;
                        case 3:
                            color = 'rgb(204, 174, 67)'; // digital
                            textValue = 'digital';
                            break;
                        case 4:
                            color = 'rgb(186, 71, 147)'; // sustainable
                            textValue = 'sustainable';
                            break;
                        // Add more cases for additional colors as needed
                        default:
                            color = 'black'; // Default color
                            textValue = 'default';
                    }

                    ctx.strokeStyle = color;

                    ctx.beginPath();
                    ctx.arc(width, height, radius, startAngle + angle, endAngle + angle, true);
                    ctx.stroke();

                    // Calculate the angle for text placement
                    const textAngle = startAngle + angle;

                    // Calculate the position for text placement
                    const textX = width + ((radius + 100) + textSpacing) * Math.cos(textAngle);
                    const textY = height + ((radius + 100) + textSpacing) * Math.sin(textAngle);

                    // Draw text along the arch
                    ctx.font = '40px Archivo'; // Change '20px Arial' to your desired font size and font family
                    ctx.save();
                    ctx.translate(textX, textY);
                    ctx.rotate(textAngle - (Math.PI/2)); // Rotate each text by 180 degrees
                    ctx.textAlign = 'center'; // Set text alignment to center
                    ctx.textBaseline = 'middle'; // Set text baseline to middle
                    ctx.fillStyle = 'white';
                    ctx.fillText(textValue, 0, 0);
                    ctx.restore();

                    startAngle = endAngle - gapAngle;
                }
            }

            // Update the animation angle
            angle += angle_increment;

            if (angle < Math.PI * 2) {
                // Request the next animation frame
                requestAnimationFrame(animate);
            }
        }

        // Start the animation loop
        animate();
    }
}


function drawStop () {

}