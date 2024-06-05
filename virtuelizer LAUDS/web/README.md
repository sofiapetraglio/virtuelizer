# virtuelizer


## author
Sofia Petraglio, Marco Lurati

## license
CC BY-NC-ND

## code development setup 

file list:
- server.js : node server to connect Arduino to the html page
- package.json and package-lock.js : required node libraries
- run.sh and virtuelizer.py and virtuelizerStart.sh : automated turn on system for Ubuntu NUC computer
- gitignore : prevents unuseful files to be uploaded to github repository

folder list:
- assets_web : files required for the html page (.css, .js, etc)
- node_modules : libraries

### package installation
$ npm install

### show list of available ports
$ node server -list

### run the server
$ node server --m X --i X
