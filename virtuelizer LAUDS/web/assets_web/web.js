const layersContainer = document.getElementById("layers_container");
const canvas = document.getElementById("canvas");
const message = document.getElementById("message");

// scroll datas
let currentIndex = 0;
const gapAngle = 0.3;  // Gap between percentages in radians
let screen_framerate = 60; // framerate of the screen
let circonferenza = 2070; // in mm
let z_gap_mm = (circonferenza / (Math.PI * 2)) * gapAngle; // gapAngle converted in mm for z-axis
let feedrate_gcode = 2000;  // mm per minute
let circonferenza_duration = circonferenza / (feedrate_gcode / 60); // durata in ms di un giro di circonferenza
// compensation between math and physical movement
let correction_coefficient = 69 / 62;
circonferenza_duration = circonferenza_duration * correction_coefficient;
console.log("circonferenza_duration: " + circonferenza_duration);

// datas for the printing of the line
let dataList = null;

// drawStop();


function updateDataList(data) {
    console.log('Interface: ' + data);
    dataList = data.split(',');
    console.log('Interface: ' + data);

    startLine();    // draw the lines
}


function lineLoop() {
    
    // If line IS finished
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
            
            let gcodeX = "G1 X" + String(((current_z - z_gap_mm)/2).toFixed(1)) + " Z" + String((current_z - z_gap_mm).toFixed(1)) + " F" + feedrate_gcode;
            console.log(gcodeX);

            // Send the gcode to the server
            sendGcode(gcodeX);


            // Compose the gcode command for Y
            let gcodeY = "G1 Y20 Z" + z_gap_mm.toFixed(1) + " F" + feedrate_gcode;
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
    let current_z = (Math.floor((Math.random()) * circonferenza / 3)).toFixed(1);
    // console.log("line completed");
    // console.log("random_z: " + current_z);
    
    let gcodeZ = "G1 Z" + String(current_z) + " F" + feedrate_gcode;
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


function draw() {

    const canvas = document.getElementById('canvas');
    const width = canvas.width / 2;
    const height = canvas.height / 2 - 1000; // set back to canvas.h.toFixed(3)eight / 2 - 1000
    const radius = width + 285; // set back to width + 285

    let animationInProgress = true; // Flag to track if animation is in progress

    // animation angle increment
    let time_line_print = circonferenza_duration; // line print time in seconds
    let angle_increment = Math.PI*2 / (screen_framerate * time_line_print);

    const ctx = canvas.getContext('2d');
    const line_width = 250; // set back to 250

    ctx.lineCap = 'round';

    // Initial angle for animation
    let angle = 0;

    // Spacing between text along the arch
    const textSpacing = 60; // Adjust this value to change the spacing between text

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all arches at the same time with animation and gap
        let initial_start_angle = Math.PI / 4.5;
        let startAngle = initial_start_angle;

        let gap_count = 0;

        // consider only the values that are bigger than 0 as a gap
        for (let i=0; i < dataList.length; i++) {
            if (dataList[i] > 0) {
                gap_count++
            }
        }

        let total_segment_angle = Math.PI * 2 - gap_count * gapAngle; // this is the sum of the total circle - total of gaps according to potentiometers bigger than 0

    
        for (let i = 0; i < dataList.length; i++) {
            if (dataList[i] > 0) {
                const endAngle = startAngle - ((dataList[i] / 100) * total_segment_angle);

                // console.log(endAngle);

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
                ctx.lineWidth = line_width;

                ctx.beginPath();
                ctx.arc(width, height, radius, startAngle + angle, endAngle + angle, true);
                ctx.stroke();

                // Calculate the angle for text placement
                const textAngle = startAngle + angle;

                // Calculate the position for text placement
                const textX = width + ((radius + 120) + textSpacing) * Math.cos(textAngle);
                const textY = height + ((radius + 120) + textSpacing) * Math.sin(textAngle);

                // Draw text along the arch
                ctx.font = '60px Archivo'; // Change '20px Arial' to your desired font size and font family
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

        /* // RIACCENDERE MASK
        // Black mask over the last value, at start
        if(angle < Math.PI / 2) {
            
            ctx.lineWidth = line_width + 155;
            ctx.beginPath();
            ctx.arc(width, height, radius, initial_start_angle + gapAngle + angle, Math.PI + angle);
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.stroke();
        }
        */
        
        // Update the animation angle
        angle += angle_increment;

        // Black mask over the last value of old line during random Z motion, at the end
        if(angle > Math.PI * 2) {
            
            ctx.lineWidth = line_width + 155;
            ctx.beginPath();
            ctx.arc(width, height, radius, (Math.PI + initial_start_angle) + angle, initial_start_angle + angle);
            //ctx.arc(width, height, radius, initial_start_angle + gapAngle + angle, -(Math.PI + angle), true);
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.stroke();
            
            // Test to end with a black mask during random Z
            //ctx.clearRect(0, 0, canvas.width, canvas.height);

        }


        if (angle < Math.PI * 2) {
            // Request the next animation frame
            requestAnimationFrame(animate);
        } else {
            // Animation is finished
            animationInProgress = false;
            console.log('animation done!');
            //drawStop(); // Show the text when animation is finished
        }
    }

    // Start the animation loop
    animate();
        // Hide the text when animation starts or resumes
    if (animationInProgress) {
        const ctx = message.getContext('2d');
        ctx.clearRect(0, 0, message.width, message.height);
    }
}


function drawStop() {
    const canvas = document.getElementById('canvas');
    const message = document.getElementById('message');

    // Clear the canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ctxMessage = message.getContext('2d');
    ctxMessage.clearRect(0, 0, message.width, message.height);

    // Draw text along the arch
    ctx.font = '60px Archivo';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    //ctx.fillRect(0, 0, message.width, message.height)
    ctx.fillText("Rate your recent purchase's sustainability", message.width / 2-600, message.height / 2+150);
    ctx.fillText('Adjust values using the knobs to reflect', message.width / 2-600, message.height / 2 + 250);
    ctx.fillText('its production process.', message.width / 2-600, message.height / 2 + 330);

}
