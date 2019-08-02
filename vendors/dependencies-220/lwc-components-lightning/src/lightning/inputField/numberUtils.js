/**
 * Given a scale returns the corresponding decimal places 'step' (ie. lowest unit of decrease/increase for a number
 * in the given scale).
 * for example given the scale 1 result in 0.1, for 2 -> 0.01, etc.
 * @param {number} scale an integer number.
 * @returns {number} 'step' for the given scale.
 */
export function scaleToDecimalPlaces(scale) {
    // Using toFixed to correct for bad js arithmetic precision, resulting
    // in 0.000009999999999999999 for Math.pow(10, -5) instead of the expected
    // 0.00001
    const resultAsString = Math.pow(10, -parseInt(scale, 10)).toFixed(scale);
    return parseFloat(resultAsString);
}
