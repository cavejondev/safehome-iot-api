-- Prevent duplicated events when a gateway retries the same message.
CREATE UNIQUE INDEX "SensorEvent_sensorId_sourceEventId_key"
ON "SensorEvent"("sensorId", "sourceEventId");

CREATE UNIQUE INDEX "HelpButtonEvent_helpButtonId_sourceEventId_key"
ON "HelpButtonEvent"("helpButtonId", "sourceEventId");
