int L = A0;  // Assign to pin A0
int A = A1;  // Assign to pin A1
int U = A2;  // Assign to pin A2
int D = A3;  // Assign to pin A3
int S = A4;  // Assign to pin A4

void setup() {
  Serial.begin(9600);      // Begin serial communication
  pinMode(L, INPUT);       // Set the pinmode of L to input
  pinMode(A, INPUT);       // Set the pinmode of A to input
  pinMode(U, INPUT);       // Set the pinmode of U to input
  pinMode(D, INPUT);       // Set the pinmode of D to input
  pinMode(S, INPUT);       // Set the pinmode of S to input
}

void loop() {
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

  delay(60000);  // Delay for 510 minutes (600000 milliseconds)
}
