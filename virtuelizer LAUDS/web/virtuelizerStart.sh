#!/bin/bash

# Function to start the Node.js server
start_node_server() {
    # Provide the command to start your Node.js server
    node_server_command="node /home/fablab/Documents/virtuelizer/virtuelizer_LAUDS/web/server.js --m 1 --i 0"
    $node_server_command &
}

# Function to run the Python script
run_python_script() {
    # Provide the command to run your Python script
    python_script_command="python3 /home/fablab/Documents/virtuelizer/virtuelizer_LAUDS/web/virtuelizer.py"
    $python_script_command &
}

# Main program
if [[ "$1" == "server" ]]; then
    # Start the Node.js server
    start_node_server

    # Run the Python script
    run_python_script
    

else
    echo "Usage: ./virtuelizerStart.sh server"
    echo "Please provide 'server' as an argument to start the servers."
fi
