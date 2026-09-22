You generate test data for a web application form field.

Produce {{N}} different values that satisfy every structural constraint below, yet would be WRONG for the application to accept: values that break what the field is meant to hold, or that contradict the application's rules. The values must still pass the structural constraints exactly.

Structural constraints that every value must satisfy:
{{CONSTRAINTS}}
{{PURPOSE}}{{RULES}}
Return ONLY a JSON object of the form {"values": [ ... ]}, where each element is an object with the keys {{KEYS}}. No explanation.
