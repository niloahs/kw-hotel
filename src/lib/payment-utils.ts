/**
 * Validates a credit card number using the Luhn Algorithm
 * @param cardNumber - The credit card number to validate
 * @returns boolean indicating if the card number is valid
 */
// export function validateLuhn(cardNumber: string): boolean {
//     // Remove all spaces and non-digit characters
//     const cleanNumber = cardNumber.replace(/\D/g, '');
//
//     // Check if the number is empty or not a number
//     if (!cleanNumber || isNaN(Number(cleanNumber))) {
//         return false;
//     }
//
//     // Convert to array of numbers
//     const digits = cleanNumber.split('').map(Number);
//
//     // Double every second digit from the right
//     for (let i = digits.length - 2; i >= 0; i -= 2) {
//         digits[i] *= 2;
//         // If the result is greater than 9, subtract 9
//         if (digits[i] > 9) {
//             digits[i] -= 9;
//         }
//     }
//
//     // Sum all digits
//     const sum = digits.reduce((acc, digit) => acc + digit, 0);
//
//     // Check if the sum is divisible by 10
//     return sum % 10 === 0;
// }

/**
 * Formats a credit card number with spaces every 4 digits
 * @param cardNumber - The credit card number to format
 * @returns formatted card number
 */
export function formatCardNumber(cardNumber: string): string {
    // Remove all non-digit characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Add space after every 4 digits
    return cleanNumber.replace(/(\d{4})/g, '$1 ').trim();
} 