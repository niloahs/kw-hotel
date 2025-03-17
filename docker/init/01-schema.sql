-- Drop tables if they exist (reverse order of dependencies)
DROP TABLE IF EXISTS service_charge;
DROP TABLE IF EXISTS reservation_change;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS seasonal_rate;
DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS room_type;
DROP TABLE IF EXISTS service;
DROP TABLE IF EXISTS guest_preference;
DROP TABLE IF EXISTS guest;
DROP TABLE IF EXISTS staff;

-- Create staff table
CREATE TABLE staff
(
    staff_id      SERIAL PRIMARY KEY,
    first_name    VARCHAR(35)  NOT NULL,
    last_name     VARCHAR(35)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255)
);

-- Create guest table
CREATE TABLE guest
(
    guest_id           SERIAL PRIMARY KEY,
    first_name         VARCHAR(35)  NOT NULL,
    last_name          VARCHAR(35)  NOT NULL,
    email              VARCHAR(100) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone              VARCHAR(15)  NOT NULL CHECK (phone ~* '^\d{3}-\d{3}-\d{4}$'),
    password_hash      VARCHAR(255),
    is_account_created BOOLEAN DEFAULT FALSE
);

-- Create room_type table
CREATE TABLE room_type
(
    room_type_id SERIAL PRIMARY KEY,
    type_name    VARCHAR(10)    NOT NULL UNIQUE CHECK (type_name IN ('Single', 'Double', 'Suite')),
    base_rate    DECIMAL(10, 2) NOT NULL CHECK (base_rate > 0)
);

-- Create room table
CREATE TABLE room
(
    room_id      SERIAL PRIMARY KEY,
    room_type_id INTEGER     NOT NULL REFERENCES room_type (room_type_id) ON DELETE RESTRICT,
    room_number  VARCHAR(5)  NOT NULL UNIQUE,
    floor_number INTEGER     NOT NULL CHECK (floor_number BETWEEN 1 AND 5),
    status       VARCHAR(15) NOT NULL CHECK (status IN
                                             ('Available', 'Occupied', 'Maintenance', 'Cleaning'))
);

-- Create seasonal_rate table
CREATE TABLE seasonal_rate
(
    seasonal_rate_id SERIAL PRIMARY KEY,
    room_type_id     INTEGER       NOT NULL REFERENCES room_type (room_type_id) ON DELETE CASCADE,
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    rate_multiplier  DECIMAL(3, 2) NOT NULL CHECK (rate_multiplier > 0),
    CHECK (end_date > start_date)
);

-- Create service table
CREATE TABLE service
(
    service_id   SERIAL PRIMARY KEY,
    service_name VARCHAR(25)    NOT NULL UNIQUE CHECK (service_name IN
                                                       ('Restaurant', 'LongDistance', 'MovieRental',
                                                        'DryClean', 'WakeUpCall', 'RoomService')),
    base_price   DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    is_external  BOOLEAN        NOT NULL
);

-- Create guest_preference table
CREATE TABLE guest_preference
(
    guest_preference_id SERIAL PRIMARY KEY,
    guest_id            INTEGER NOT NULL REFERENCES guest (guest_id) ON DELETE CASCADE,
    room_type_id        INTEGER NOT NULL REFERENCES room_type (room_type_id) ON DELETE RESTRICT,
    UNIQUE (guest_id, room_type_id)
);

-- Create reservation table
CREATE TABLE reservation
(
    reservation_id    SERIAL PRIMARY KEY,
    guest_id          INTEGER        NOT NULL REFERENCES guest (guest_id) ON DELETE RESTRICT,
    room_id           INTEGER        NOT NULL REFERENCES room (room_id) ON DELETE RESTRICT,
    staff_id          INTEGER        NOT NULL REFERENCES staff (staff_id) ON DELETE RESTRICT,
    check_in_date     DATE           NOT NULL,
    check_out_date    DATE           NOT NULL,
    status            VARCHAR(15)    NOT NULL CHECK (status IN
                                                     ('Confirmed', 'Pending', 'Cancelled',
                                                      'CheckedIn',
                                                      'CheckedOut')),
    total_amount      DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status    VARCHAR(10)    NOT NULL CHECK (payment_status IN ('Paid', 'Unpaid')),
    payment_method    VARCHAR(12)    NOT NULL CHECK (payment_method IN
                                                     ('Credit Card', 'Debit Card')),
    confirmation_code VARCHAR(10) UNIQUE,
    is_claimed        BOOLEAN DEFAULT FALSE,
    CHECK (check_out_date > check_in_date)
);

-- Create reservation_change table
CREATE TABLE reservation_change
(
    reservation_change_id SERIAL PRIMARY KEY,
    reservation_id        INTEGER      NOT NULL REFERENCES reservation (reservation_id) ON DELETE CASCADE,
    staff_id              INTEGER      NOT NULL REFERENCES staff (staff_id) ON DELETE RESTRICT,
    change_type           VARCHAR(15)  NOT NULL CHECK (change_type IN
                                                       ('DateChange', 'Cancellation')),
    old_value             VARCHAR(255) NOT NULL,
    new_value             VARCHAR(255) NOT NULL,
    change_date           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    request_status        VARCHAR(10)  NOT NULL DEFAULT 'Completed'
        CHECK (request_status IN ('Pending', 'Approved', 'Denied', 'Completed'))
);

-- Create service_charge table
CREATE TABLE service_charge
(
    service_charge_id SERIAL PRIMARY KEY,
    service_id        INTEGER        NOT NULL REFERENCES service (service_id) ON DELETE RESTRICT,
    reservation_id    INTEGER        NOT NULL REFERENCES reservation (reservation_id) ON DELETE CASCADE,
    quantity          INTEGER        NOT NULL CHECK (quantity > 0),
    charged_amount    DECIMAL(10, 2) NOT NULL CHECK (charged_amount >= 0),
    charge_date       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for some performance optimization
CREATE INDEX idx_room_status ON room (status);
CREATE INDEX idx_reservation_dates ON reservation (check_in_date, check_out_date);
CREATE INDEX idx_reservation_status ON reservation (status);
CREATE INDEX idx_guest_email ON guest (email);
CREATE INDEX idx_seasonal_rate_dates ON seasonal_rate (start_date, end_date);