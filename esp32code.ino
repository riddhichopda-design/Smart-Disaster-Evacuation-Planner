/*
  Smart Disaster Detection & Alert System (Single ESP32, No Buzzer)
  Sensors:
    - 1x HW-493 Vibration
    - 2x HW-038 Water
    - 2x MQ-2 Smoke
    - 2x Tilt Sensors
  Outputs:
    - Red LED (Danger)
    - Green LED (Safe)
  Serial Output: JSON data for web integration
*/

#define VIBRATION 32
#define WATER1 33
#define WATER2 34
#define SMOKE1 35
#define SMOKE2 27
#define TILT1 22
#define TILT2 23
#define RED_LED 25
#define GREEN_LED 26

#define WATER_THRESHOLD 1850
#define SMOKE_THRESHOLD1 750
#define SMOKE_THRESHOLD2 2000

bool dangerDetected = false;

void setup() {
  Serial.begin(115200);

  // Sensor pins
  pinMode(VIBRATION, INPUT);
  pinMode(WATER1, INPUT);
  pinMode(WATER2, INPUT);
  pinMode(SMOKE1, INPUT);
  pinMode(SMOKE2, INPUT);
  pinMode(TILT1, INPUT);
  pinMode(TILT2, INPUT);

  // LED pins
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // Default LED state
  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, HIGH);

  Serial.println("System Initialized...");
}

void loop() {
  // Read sensors
  int vibration = digitalRead(VIBRATION);
  int water1 = analogRead(WATER1);
  int water2 = analogRead(WATER2);
  int smoke1 = analogRead(SMOKE1);
  int smoke2 = analogRead(SMOKE2);
  int tilt1 = digitalRead(TILT1);
  int tilt2 = digitalRead(TILT2);

  // Check for danger
  dangerDetected = false;
  if (vibration == HIGH) dangerDetected = true;
  if (water1 > WATER_THRESHOLD) dangerDetected = true;
  if (water2 > WATER_THRESHOLD) dangerDetected = true;
  if (smoke1 > SMOKE_THRESHOLD1) dangerDetected = true;
  if (smoke2 > SMOKE_THRESHOLD2) dangerDetected = true;
  if (tilt1 == HIGH) dangerDetected = true;
  if (tilt2 == HIGH) dangerDetected = true;

  // LED logic
  if (dangerDetected) {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
  } else {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
  }

  // Send JSON to serial (single line)
  Serial.print("{");
  Serial.print("\"vibration\":"); Serial.print(vibration); Serial.print(",");
  Serial.print("\"water1\":"); Serial.print(water1); Serial.print(",");
  Serial.print("\"water2\":"); Serial.print(water2); Serial.print(",");
  Serial.print("\"smoke1\":"); Serial.print(smoke1); Serial.print(",");
  Serial.print("\"smoke2\":"); Serial.print(smoke2); Serial.print(",");
  Serial.print("\"tilt1\":"); Serial.print(tilt1); Serial.print(",");
  Serial.print("\"tilt2\":"); Serial.print(tilt2);
  Serial.println("}");

  delay(1000); // Update every 1 second
}