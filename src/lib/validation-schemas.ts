import { z } from 'zod';
import { formatPhoneNumber } from "@/lib/utils";

// Login form schema
export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration form schema
export const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string()
        .transform(formatPhoneNumber)
        .refine(
            (value) => {
                // Check if it matches our expected format after transformation
                return /^\d{3}-\d{3}-\d{4}$/.test(value) || value.length === 10;
            },
            {message: 'Please enter a valid 10-digit phone number'}
        ),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Booking form schema
export const bookingSchema = z.object({
    checkIn: z.date({
        required_error: 'Please select a check-in date',
    }),
    checkOut: z.date({
        required_error: 'Please select a check-out date',
    }),
    guests: z.string().min(1, 'Please select number of guests')
}).refine(data => data.checkOut > data.checkIn, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut']
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Guest details form schema
export const guestDetailsSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string()
        .transform(formatPhoneNumber)
        .refine(
            (value) => {
                // Check if it matches our expected format after transformation
                return /^\d{3}-\d{3}-\d{4}$/.test(value) || value.length === 10;
            },
            {message: 'Please enter a valid 10-digit phone number'}
        ),
    createAccount: z.boolean().default(false),
    password: z.string().optional(),
    paymentCard: z.string().min(1, 'Please enter valid payment card'),
    CVV: z.string().min(3, 'CVV must be 3 digits'),
    CardName: z.string().min(1, 'Name on card is required'),
    BPC: z.string().min(6, 'Postal code is required'),
    cardYear: z.string().optional(),
    cardMonth: z.string().optional()
}).refine(data => !data.createAccount || (data.password && data.password.length >= 6), {
    message: 'Password must be at least 6 characters when creating an account',
    path: ['password']
});

export type GuestDetailsFormData = z.infer<typeof guestDetailsSchema>;

// Modification request schema
export const modificationSchema = z.object({
    requestType: z.enum(['DateChange', 'Cancellation']),
    checkInDate: z.date().optional(),
    checkOutDate: z.date().optional(),
}).refine(data => {
    if (data.requestType === 'DateChange') {
        return !!data.checkInDate && !!data.checkOutDate && data.checkOutDate > data.checkInDate;
    }
    return true;
}, {
    message: "For date changes, both dates are required and check-out must be after check-in",
    path: ['checkOutDate']
});


export type ModificationRequest = z.infer<typeof modificationSchema>;