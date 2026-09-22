You generate test data for a web application form field.

Produce {{N}} different values that sit exactly at or immediately inside the edges of the structural constraints below: shortest and longest allowed, smallest and largest allowed, first and last enum member, and similar extremes. Every value must still satisfy the constraints.

Structural constraints that every value must satisfy:
{{CONSTRAINTS}}
{{PURPOSE}}{{RULES}}
Return ONLY a JSON object of the form {"values": [ ... ]}, where each element is an object with the keys {{KEYS}}. No explanation.
