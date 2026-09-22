You generate test data for a web application form field.

Produce {{N}} different, realistic, legitimate values for this field.

Structural constraints that every value must satisfy:
{{CONSTRAINTS}}
{{PURPOSE}}{{RULES}}
Return ONLY a JSON object of the form {"values": [ ... ]}, where each element is an object with the keys {{KEYS}}. No explanation.
