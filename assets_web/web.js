const layersContainer = document.getElementById("layers_container");


// scroll datas
let currentLine = 0;

function startConstruction() {

    function dataLoop() {

        setTimeout(()=> {
            // compose the gcode command
            let gcode = "G1 X" + dataList[currentLine][0] + " F1000";
            console.log(gcode);

            // send the gcode to the server
            //sendGcode(gcode);

            // add new layer on the html page inside the layerContainer

            // layer container
            const layerContainer = document.createElement("div");
            layerContainer.classList.add("layer_container");
            layersContainer.prepend(layerContainer);

            // layer values
            const social = document.createElement("div");
            social.classList.add("layer_social");

            const sustainable = document.createElement("div");
            sustainable.classList.add("layer_sustainable");

            const natural = document.createElement("div");
            natural.classList.add("layer_natural");

            const tradition = document.createElement("div");
            tradition.classList.add("layer_tradition");

            // check if the layer value has to be added to the layerContainer or not (> 0)
            if(dataList[currentLine][0] > 0) {  //social
                social.style.width = dataList[currentLine][0] + "%";
                layerContainer.appendChild(social);

            }
            if(dataList[currentLine][1] > 0) {  //sustainable
                sustainable.style.width = dataList[currentLine][1] + "%";
                layerContainer.appendChild(sustainable);
            }
            if(dataList[currentLine][2] > 0) {  //natural
                natural.style.width = dataList[currentLine][2] + "%";
                layerContainer.appendChild(natural);
            }
            if(dataList[currentLine][3] > 0) {  //tradition
                tradition.style.width = dataList[currentLine][3] + "%";
                layerContainer.appendChild(tradition);
            }

            // increment the current data list line
            currentLine++;
            // check if the list is finished
            if(currentLine > dataList.length - 1) {
                currentLine = 0;    // reset the current line
            }
            else {
                dataLoop();
            }

        }, dataList[currentLine][4]);   // delay time in ms
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