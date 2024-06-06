int L = A0;  // Assign to pin A0
int A = A1;  // Assign to pin A1
int U = A2;  // Assign to pin A2
int D = A3;  // Assign to pin A3
int S = A4;  // Assign to pin A4

#define button 8  // connect button to D8
#define led 3   // assign to pin 13 for the LED


int button_state = 0;         // variable for reading the pushbutton status
int prev_button_state = 0;    // variable to store the previous state of the pushbutton
bool button_pressed = false;  // flag to track if the button is clicked


void setup() {
  Serial.begin(9600);       // Begin serial communication
  pinMode(L, INPUT);        // Set the pinmode of L to input
  pinMode(A, INPUT);        // Set the pinmode of A to input
  pinMode(U, INPUT);        // Set the pinmode of U to input
  pinMode(D, INPUT);        // Set the pinmode of D to input
  pinMode(S, INPUT);        // Set the pinmode of S to input
  pinMode(button, INPUT);   // Set the pinmode of button to input
  pinMode(led, OUTPUT);  // Set the pinmode of ledPin to output
}

void loop() {

    digitalWrite(led, HIGH);   // Turn LED on


  button_state = digitalRead(button);  // read the state of the pushbutton value

  if (button_state != prev_button_state && button_state == HIGH) {
    // Button is clicked once
    button_pressed = true;  // Toggle the button pressed state
    //Serial.println("Button clicked!");
  }

  prev_button_state = button_state;  // Update previous button state

  if (button_pressed) {
    // Read potentiometer values only when the button is pressed
    int sensor_value1 = analogRead(L);                 // Read the value from potentiometer L connected to pin A0
    int value1 = map(sensor_value1, 0, 1023, 0, 100);  // Map the value from 0 to 1023 to 0 to 100

    int sensor_value2 = analogRead(A);                 // Read the value from potentiometer A connected to pin A1
    int value2 = map(sensor_value2, 0, 1023, 0, 100);  // Map the value from 0 to 1023 to 0 to 100

    int sensor_value3 = analogRead(U);                 // Read the value from potentiometer U connected to pin A2
    int value3 = map(sensor_value3, 0, 1023, 0, 100);  // Map the value from 0 to 1023 to 0 to 100

    int sensor_value4 = analogRead(D);                 // Read the value from potentiometer D connected to pin A3
    int value4 = map(sensor_value4, 0, 1023, 0, 100);  // Map the value from 0 to 1023 to 0 to 100

    int sensor_value5 = analogRead(S);                 // Read the value from potentiometer S connected to pin A4
    int value5 = map(sensor_value5, 0, 1023, 0, 100);  // Map the value from 0 to 1023 to 0 to 100

    // Calculate total sum of all potentiometer values
    int totalSum = value1 + value2 + value3 + value4 + value5;

    // Calculate proportions for each potentiometer
    float proportion1 = (value1 * 100) / totalSum;
    float proportion2 = (value2 * 100) / totalSum;
    float proportion3 = (value3 * 100) / totalSum;
    float proportion4 = (value4 * 100) / totalSum;
    float proportion5 = (value5 * 100) / totalSum;

    // Normalize proportions to ensure they sum up to 100
    float scaleFactor = 100 / (proportion1 + proportion2 + proportion3 + proportion4 + proportion5);
    proportion1 *= scaleFactor;
    proportion2 *= scaleFactor;
    proportion3 *= scaleFactor;
    proportion4 *= scaleFactor;
    proportion5 *= scaleFactor;

    // Create a string containing the values
    String values = String(proportion1) + "," + String(proportion2) + "," + String(proportion3) + "," + String(proportion4) + "," + String(proportion5);

    Serial.println(values);  // Print the string containing the values

    button_pressed = false;  // Reset the flag to prevent further readings
    
    // Blink the LED during the delay period
    for (int i = 0; i < 40; i++) {  //up to 60 times makes it 'freezed' during 60'000 ms
      digitalWrite(led, HIGH);   // Turn LED on
      delay(1000);                   // Wait for 500 milliseconds
      digitalWrite(led, LOW);    // Turn LED off
      delay(1000);                   // Wait for 500 milliseconds
    }
  
  }
}