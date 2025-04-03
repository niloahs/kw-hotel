// Room Types
export interface RoomType {
    roomTypeId: number;
    typeName: string;
    baseRate: number;
}

export interface Room {
    roomId: number;
    roomTypeId: number;
    roomNumber: string;
    floorNumber: number;
    status: 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';
    typeName?: string;
    baseRate?: number;
    adjustedRate?: number;
}

// User Types
export interface Guest {
    guestId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isAccountCreated: boolean;
}

export interface Staff {
    staffId: number;
    firstName: string;
    lastName: string;
    email: string;
}

// Reservation Types
export interface Reservation {
    reservationId: number;
    guestId: number;
    roomId: number;
    staffId: number;
    checkInDate: string;
    checkOutDate: string;
    status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
    totalAmount: number;
    paymentStatus: 'Paid' | 'Unpaid';
    paymentMethod: string;
    confirmationCode?: string;
    guestName?: string;
    roomNumber?: string;
    roomType?: string;
    isClaimed?: boolean;
}

//z User Reservation Types
export interface UserReservation extends Reservation {
    guestName: string;
    roomNumber: string;
    roomType: string;
    requestStatus: string;
    changeType?: 'DateChange' | 'Cancellation';
}


export interface Service {
    service_id: number;
    service_name: string;
    base_price: number;
  }

export interface ServiceCharge {
    serviceChargeId: number;
    serviceId: number;
    reservationId: number;
    quantity: number;
    chargedAmount: number;
    chargeDate: string;
    serviceName?: string;
}

export interface BillDetail {
    reservation: Reservation;
    nights: number;
    nightlyRate: number;
    roomTotal: number;
    serviceCharges: ServiceCharge[];
    serviceChargeTotal: number;
    billTotal: number;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
    userType: 'guest' | 'staff';
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
}

// Booking Types
export interface BookingData {
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    roomId: number;
    guestDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        createAccount: boolean;
        password?: string;
    };
}