import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date
export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }

        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return "Date error";
    }
}

// Calculate number of nights between two dates
export function calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Helper function to format phone numbers
export function formatPhoneNumber(phone: string): string {
    // Strip all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Check if we have exactly 10 digits
    if (digits.length === 10) {
        return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
    }

    // Return original input for cases that don't match 10 digits
    return phone;
}
