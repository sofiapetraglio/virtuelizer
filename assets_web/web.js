const layersContainer = document.getElementById("layers_container");
const canvas = document.getElementById("canvas");

// scroll datas
let currentLine = 0;
let currentIndex = 0;
let circonferenza = 910.6; // in mm
let circonferenza_duration = 0; // durata in ms di un giro di circonferenza


function lineLoop() {
    
    // If line IS finishe
    if (currentIndex >= dataList[currentLine].length - 1) {
        stopLine();
    }
    else { // If line IS NOT finished

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

    // Send the gcode to the server
    sendGcode(gcodeZ); // CHECK IF IT WORKS OR REMOVE

    
    // Move to the next job
    if(currentLine == dataList.length - 1) {
        console.log('\n\n>>>> Print finished! <<<<<\n\n');
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
    draw();
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


function draw() {
    const canvas = document.getElementById('canvas');
    //const radius = canvas.width / 2 - 50;
    const radius = 200;

    const width = canvas.width / 2;
    const height = canvas.height/2;

    let colors = [
        'rgb(255, 0, 0)',
        'rgb(0, 255, 0)',
        'rgb(255, 0, 255)',
        'rgb(0, 255, 255)',
        'rgb(255, 255, 0)'
    ];

    // animation angle increment
    let screen_framerate = 30; // framerate del website
    let time_line_print = 5;   // line print time in seconds
    let angle_increment = Math.PI / (screen_framerate * time_line_print);

    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        const line_width = 40;

        ctx.lineWidth = line_width; // Line thickness
        ctx.lineCap = 'round'; // Set line cap to round for rounded ends
        // ctx.strokeStyle = 'rgb(255, 255, 255)';

        // Initial angle for animation
        let angle = 0;

        // Gap between percentages
        const gapAngle = 0.3; // Adjust the gap as needed

        function animate() {
            // Clear the canvas on each frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw all arches at the same time with animation and gap
            let initial_start_angle = Math.PI / 4; // aggiustare angolo secondo plexi
            let startAngle = initial_start_angle; 

            let segments_count = 0;
            for (let i = 0; i < dataList[currentLine].length - 1; i++) {
                if(dataList[currentLine][i] > 0) {
                    segments_count = segments_count + 1;
                } 
            }

            // console.log('segments_count: ' + segments_count);

            let total_segment_angle = Math.PI  * 2 - segments_count * gapAngle;
                

            for (let i = 0; i < dataList[currentLine].length-1; i++) {

                if(dataList[currentLine][i] != 0) {
                    const endAngle = startAngle - (dataList[currentLine][i] / 100) * total_segment_angle;

                    ctx.strokeStyle = colors[i];

                    //console.log(startAngle + angle);
                    ctx.beginPath();
                    ctx.arc(width, height, radius, startAngle
                        + angle, endAngle + angle, true) ;
                    ctx.stroke();
                    

                    //console.log("i: "  + i + " startAngle: " + startAngle + " endAngle: " + endAngle)

                    // Add gap between percentages
                    startAngle = endAngle - gapAngle;
                    //startAngle = endAngle + angle + gapAngle;
                    
                }
            }
            
            if(angle < Math.PI / 2) {
                
                ctx.lineWidth = line_width + 5;
                ctx.beginPath();
                ctx.arc(width, height, radius, initial_start_angle + gapAngle + angle, Math.PI + angle);
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.stroke();
            }

            // Update the animation angle
            angle += angle_increment;

            if(angle < Math.PI *2 ) {
                // Request the next animation frame
                requestAnimationFrame(animate);
            }
        }
    // Start the animation loop
    animate();
        
    }
}