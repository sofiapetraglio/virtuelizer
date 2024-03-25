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
    draw(currentLine);
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


function draw(currentLine) {
    
    const canvas = document.getElementById('canvas');    

    const width = canvas.width/2;
    const height = canvas.height/2-1000;
    const radius = width + 240;


    // animation angle increment
    let screen_framerate = 30; // framerate del website
    let time_line_print = 26;   // line print time in seconds, set back to 76
    let angle_increment = Math.PI / (screen_framerate * time_line_print);

    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        const line_width = 250;

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
            let initial_start_angle = Math.PI / 4.5; // angolo giusto a Math.PI / 4.5
            let startAngle = initial_start_angle; 

            let segments_count = 0;

            for (let i = 0; i < dataList[currentLine].length - 1; i++) {
                if(dataList[currentLine][i] > 0) {
                    segments_count = segments_count + 1;
                } 
            }

            // console.log('segments_count: ' + segments_count);

            let total_segment_angle = Math.PI  * 2 - segments_count * gapAngle;
                
            let colors = [];

            // Conditions to colors
            for (let i = 0; i < dataList[currentLine].length - 1; i++) {
                if ([i] == 0) { // collaboration
                    colors.push('rgb(186, 71, 71)');
                }
                if ([i] == 1) { // uniqueness
                    colors.push('rgb(71, 166, 186)');
                }
                if ([i] == 2) { // natural resources
                    colors.push('rgb(94, 186, 71)');
                }
                if ([i] == 3) { // sustainable processes
                    colors.push('rgb(204, 174, 67)');
                }
                if ([i] == 3) { // tradition
                    colors.push('rgb(186, 71, 147)');
                }
                if ([i] == 3) { // social inclusion
                    colors.push('rgb(115, 71, 186)');
                }
                if ([i] == 3) { // handmade
                    colors.push('rgb(192, 111, 53)');
                }
                if ([i] == 3) { // local
                    colors.push('rgb(71, 96, 187)');
                }
                if ([i] == 3) { // waste reuse
                    colors.push('rgb(120, 78, 54)');
                }


                for (let i = 0; i < dataList[currentLine].length-1; i++) {
                    
                    if(dataList[currentLine][i] != 0) {
                        const endAngle = startAngle - (dataList[currentLine][i] / 100) * total_segment_angle;

                        ctx.strokeStyle = colors[i];

                        // Draw the arch
                        //console.log(startAngle + angle);
                        ctx.beginPath();
                        ctx.arc(width, height, radius, startAngle
                            + angle, endAngle + angle, true) ;
                        ctx.stroke();
                        
                        /*
                        // Add text along the arch
                        const text = `${dataList[0][i]}%`; // Text from the dataset
                        const textAngle = (startAngle + endAngle) / 2 + angle; // Angle for text placement
                        const textX = width + radius * Math.cos(textAngle);
                        const textY = height + radius * Math.sin(textAngle);
                        ctx.fillText(text, textX, textY);
                        */

                        //console.log("i: "  + i + " startAngle: " + startAngle + " endAngle: " + endAngle)

                        // Add gap between percentages
                        startAngle = endAngle - gapAngle;
                        //startAngle = endAngle + angle + gapAngle;
                        
                    }
                }
            }

            // Black mask over the last value, at start
            if(angle < Math.PI / 2) {
                
                ctx.lineWidth = line_width + 5;
                ctx.beginPath();
                ctx.arc(width, height, radius, initial_start_angle + gapAngle + angle, Math.PI + angle);
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.stroke();
            }


            // Black mask over the last value of old line during random Z motion, at the end
            //if(angle > Math.PI*2) {
                /*
                ctx.lineWidth = line_width + 5;
                ctx.beginPath();
                ctx.arc(width, height, radius, initial_start_angle + gapAngle + angle, -(Math.PI + angle), true);
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.stroke();
                */
               
               // Test to end with a black mask during random Z
               //ctx.clearRect(0, 0, canvas.width, canvas.height);

            //}

            // Update the animation angle
            angle += angle_increment;

            //if(angle < Math.PI *2 + Math.PI /2) { // If per mettere maschera a fine
            if(angle < Math.PI *2) {

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