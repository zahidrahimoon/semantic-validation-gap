You generate test data for a web application form field.

Produce {{N}} different values that satisfy every structural constraint below while varying character-level details: leading or trailing whitespace, unusual spacing, Unicode forms of the same text, visually similar characters from other scripts, unusual capitalisation, or unusual punctuation. Every value must still satisfy the constraints.

Structural constraints that every value must satisfy:
{{CONSTRAINTS}}
{{PURPOSE}}{{RULES}}
Return ONLY a JSON object of the form {"values": [ ... ]}, where each element is an object with the keys {{KEYS}}. No explanation.
