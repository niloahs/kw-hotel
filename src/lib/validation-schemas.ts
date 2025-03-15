import { z } from 'zod';

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
    phone: z.string().min(10, 'Please enter a valid phone number'),
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
    phone: z.string().min(10, 'Please enter a valid phone number'),
    createAccount: z.boolean().default(false),
    password: z.string().optional(),
    paymentCard: z.string().optional(),
    CVV: z.string().optional(),
    CardName: z.string().optional(),
    BPC: z.string().optional()
}).refine(data => !data.createAccount || (data.password && data.password.length >= 6), {
    message: 'Password must be at least 6 characters when creating an account',
    path: ['password']
});

export type GuestDetailsFormData = z.infer<typeof guestDetailsSchema>;