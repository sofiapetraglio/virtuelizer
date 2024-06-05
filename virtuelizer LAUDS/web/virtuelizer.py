import os
import time

# Main program
if __name__ == "__main__":

	time.sleep(2) # wait for node to be fully running

	cmd = "/usr/bin/firefox --kiosk --private-window http://localhost:3000"
	os.system(cmd)
