const layersContainer = document.getElementById("layers_container");
const canvas = document.getElementById("canvas");
const message = document.getElementById("message");


/**
 * ANIMATION AND PHYSICAL PARAMETERS, to adjust according to physical measures of the installation
 */ 

// scroll data and set physical dimensions
let currentIndex = 0;
const gapAngle = 0.3;  // gap between arches, in radians
let screen_framerate = 60; // framerate of the screen, ADJUST according to the screen
let circonferenza = 2070; // circumference in mm
let plexi_gap = 1.396;  // 80 degrees of visible screen, in radians
let z_gap_mm = (circonferenza / (Math.PI * 2)) * gapAngle; // gapAngle converted in mm for Z-axis
let feedrate_gcode = 2000;  // mm per minute
let circonferenza_duration = circonferenza / (feedrate_gcode / 60); // duration of one complete round in ms
let correction_coefficient = 69 / 62;  // compensation between maths and physical movement
circonferenza_duration = circonferenza_duration * correction_coefficient; // correct cirumference duration with compensation
console.log("circonferenza_duration: " + circonferenza_duration);

// datas for the printing of the line
let dataList = null;

// font
let font = new FontFace("Archivo", "url(Archivo-Regular.ttf) format('ttf'), url(Archivo-Regular.woff) format('woff')");
font.load().then(() => {
    console.log("Font loaded!");
    document.fonts.add(font);   // required to load the font in the page!
    drawStop();
});

// update datas received from the arduino
function updateDataList(data) {
    console.log('Interface: ' + data);
    dataList = data.split(',');
    console.log('Interface: ' + data);

    startLine();    // draw the lines
}


/**
 * G-CODE CREATION FOR MOTORS
 */ 

function lineLoop() {
    
    // if line IS finished
    if (currentIndex >= dataList.length) {
        stopLine();
    }
    else { // if line IS NOT finished

        console.log('currentIndex: ' + currentIndex + ', current value: ' + dataList[currentIndex]);

        // check if the parameter IS different than 0 and has to be printed    
        if (dataList[currentIndex] != 0) {

            // compose the g-code command for X
            let current_z = (dataList[currentIndex]/100 * circonferenza);
            
            let gcodeX = "G1 X" + String(((current_z - z_gap_mm)/2).toFixed(1)) + " Z" + String((current_z - z_gap_mm).toFixed(1)) + " F" + feedrate_gcode;
            console.log(gcodeX);

            sendGcode(gcodeX); // send the g-code to the server



            // compose the g-code command for Y
            let gcodeY = "G1 Y20 Z" + z_gap_mm.toFixed(1) + " F" + feedrate_gcode;
            console.log(gcodeY);

            sendGcode(gcodeY); // send the g-code to the server

            currentIndex++; // increment the current data list index for Z

            lineLoop();

        // if parameter IS 0 move to the next index
        } else {
            currentIndex++;
            lineLoop();
        }
    }
}


/**
 * RANDOM Z MOVEMENT AT THE END OF THE CIRCLE, in order not to begin always in the same spot
 */ 

function stopLine() {
    
    // choose random new start if line IS finished
    console.log('> Stop Line! <');
    let current_z = (Math.floor((Math.random()) * circonferenza / 3)).toFixed(1);
    // console.log("line completed");
    // console.log("random_z: " + current_z);
    
    let gcodeZ = "G1 Z" + String(current_z) + " F" + feedrate_gcode;
    console.log('Random Z advancement: ' + gcodeZ);

    sendGcode(gcodeZ); // send the g-code to the server

    console.log('\n\n');
    currentIndex = 0;
}

function startLine() {
    console.log('>>>> Start the new line <<<<< \n');
    draw();
    lineLoop();
}


/**
 * ANIMATION ON SCREEN
 */ 

function draw() {

    // SETUP FOR ANIMATION

    // set the position of the animation on screen, ADJUST according to plexi mask
    const canvas = document.getElementById('canvas');
    const width = canvas.width / 2;
    const height = canvas.height / 2 - 1000;
    const radius = width + 285;

    let animationInProgress = true; // flag to track if animation is in progress

    // animation angle increment
    let time_line_print = circonferenza_duration; // line print time in seconds
    let angle_increment = Math.PI*2 / (screen_framerate * time_line_print);

    const ctx = canvas.getContext('2d');

    // arches and text
    const line_width = 250; // arches' line width
    ctx.lineCap = 'round';
    const textSpacing = 60; // spacing between text along the arch

    // initial angle for animation
    let angle = 0;

    // MAIN FUNCTION FOR ANIMATION ON SCREEN

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas from previous designs


        // ARCHES ANIMATION AND COLORING

        // draw all arches at the same time with animation and gap
        let initial_start_angle = Math.PI / 4.5; // ADJUST according to the plexi mask
        let startAngle = initial_start_angle;

        let gap_count = 0;

        // consider only the values that are BIGGER than 0 as a gap
        for (let i=0; i < dataList.length; i++) {
            if (dataList[i] > 0) {
                gap_count++
            }
        }

        // sum of the total circle - total gaps according to values BIGGER than 0
        let total_segment_angle = Math.PI * 2 - gap_count * gapAngle; 

        // if index is BIGGER than 0 assign correct dimension, color and text
        for (let i = 0; i < dataList.length; i++) {
            if (dataList[i] > 0) {
                const endAngle = startAngle - ((dataList[i] / 100) * total_segment_angle);

                // color conditions
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
                    // add more cases for additional colors as needed
                    default:
                        color = 'black'; // default color
                        textValue = 'default';
                }

                // arches 
                ctx.strokeStyle = color;
                ctx.lineWidth = line_width;

                ctx.beginPath();
                ctx.arc(width, height, radius, startAngle + angle, endAngle + angle, true);
                ctx.stroke();


                // TEXT ASSIGNMENT AND POSITIONING

                // calculate angle for text placement
                const textAngle = startAngle + angle;

                // calculate position for text placement
                const textX = width + ((radius + 120) + textSpacing) * Math.cos(textAngle);
                const textY = height + ((radius + 120) + textSpacing) * Math.sin(textAngle);

                // draw text along the arch
                ctx.save();
                ctx.translate(textX, textY);
                ctx.rotate(textAngle - (Math.PI/2)); // rotate each text by 180 degrees
                ctx.textAlign = 'center'; // set text alignment to center
                ctx.textBaseline = 'middle'; // set text baseline to middle
                ctx.fillStyle = 'white';
                ctx.font = '60px "Archivo"';
                ctx.fillText(textValue, 0, 0);
                ctx.restore();

                startAngle = endAngle - gapAngle; // set new startAngle for next 
            }
        }


        // MASK AT THE START AND END OF THE ANIMATION, ADJUST according to plexi mask

        // AT START, black mask over the last arch
        if(angle < Math.PI / 2) {
            
            ctx.lineWidth = line_width + 155;
            ctx.beginPath();
            ctx.arc(width, height, radius, initial_start_angle + gapAngle + angle, Math.PI + angle);
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.stroke();
        }
        
        // update the animation angle
        angle += angle_increment;

        // AT THE END, black mask over the first value of the line during random Z motion
        if(angle > Math.PI * 2) {
            
            ctx.lineWidth = line_width + 155; // ADJUST value according to line_width to avoid covering other arches
            ctx.beginPath();
            ctx.arc(width, height, radius, (Math.PI + initial_start_angle) + angle, initial_start_angle + angle);
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.stroke();
        }

        // request the next animation frame
        if (angle < Math.PI * 2 + plexi_gap) {
            requestAnimationFrame(animate);

        } else { // animation IS finished

            animationInProgress = false;
            console.log('animation done!');
            drawStop(); // show the text
        }
    }

    // start the animation loop
    animate();

    // hide the idle message when animation starts or resumes
    if (animationInProgress) {
        const ctx = message.getContext('2d');
        ctx.clearRect(0, 0, message.width, message.height);
    }
}


/**
 * IDLE MESSAGE ON SCREEN WHEN FINISHED TO PRINT
 */ 

function drawStop() {
    const canvas = document.getElementById('canvas');
    const message = document.getElementById('message');

    // clear the canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ctxMessage = message.getContext('2d');
    ctxMessage.clearRect(0, 0, message.width, message.height);

    // draw text along the arch
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.font = '60px "Archivo"';
    ctx.fillText("Rate the last purchase you made.", message.width / 2-600, message.height / 2+150);
    ctx.fillText('Adjust values using the knobs to reflect', message.width / 2-600, message.height / 2 + 250);
    ctx.fillText('its production process.', message.width / 2-600, message.height / 2 + 330);

}
