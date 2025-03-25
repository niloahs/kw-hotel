-- Insert staff members
INSERT INTO staff (first_name, last_name, email)
VALUES ('Basil', 'Cleese', 'basil@kingwilliam.com'),
       ('Polly', 'Sherman', 'polly@kingwilliam.com'),
       ('Manuel', 'Torres', 'manuel@kingwilliam.com');

-- Insert room types
INSERT INTO room_type (type_name, base_rate)
VALUES ('Single', 95.00),
       ('Double', 130.00),
       ('Suite', 165.00);

-- Insert rooms (15 singles across floors 2-4)
INSERT INTO room (room_type_id, room_number, floor_number, status)
VALUES
-- Singles on floor 2
(1, '201', 2, 'Available'),
(1, '202', 2, 'Available'),
(1, '203', 2, 'Available'),
(1, '204', 2, 'Available'),
(1, '205', 2, 'Available'),
-- Singles on floor 3
(1, '301', 3, 'Available'),
(1, '302', 3, 'Available'),
(1, '303', 3, 'Available'),
(1, '304', 3, 'Available'),
(1, '305', 3, 'Available'),
-- Singles on floor 4
(1, '401', 4, 'Available'),
(1, '402', 4, 'Available'),
(1, '403', 4, 'Available'),
(1, '404', 4, 'Available'),
(1, '405', 4, 'Available'),

-- Insert rooms (22 doubles on floors 2-3)
-- Doubles on floor 2
(2, '206', 2, 'Available'),
(2, '207', 2, 'Available'),
(2, '208', 2, 'Available'),
(2, '209', 2, 'Available'),
(2, '210', 2, 'Available'),
(2, '211', 2, 'Available'),
(2, '212', 2, 'Available'),
(2, '213', 2, 'Available'),
(2, '214', 2, 'Available'),
(2, '215', 2, 'Available'),
(2, '216', 2, 'Available'),
-- Doubles on floor 3
(2, '306', 3, 'Available'),
(2, '307', 3, 'Available'),
(2, '308', 3, 'Available'),
(2, '309', 3, 'Available'),
(2, '310', 3, 'Available'),
(2, '311', 3, 'Available'),
(2, '312', 3, 'Available'),
(2, '313', 3, 'Available'),
(2, '314', 3, 'Available'),
(2, '315', 3, 'Available'),
(2, '316', 3, 'Available'),

-- Insert rooms (4 suites on floor 5)
(3, '501', 5, 'Available'),
(3, '502', 5, 'Available'),
(3, '503', 5, 'Available'),
(3, '504', 5, 'Available');

-- Insert seasonal rates (summer high season)
INSERT INTO seasonal_rate (room_type_id, start_date, end_date, rate_multiplier)
VALUES (1, '2025-06-01', '2025-09-01', 1.25), -- Singles in summer
       (2, '2025-06-01', '2025-09-01', 1.20), -- Doubles in summer
       (3, '2025-06-01', '2025-09-01', 1.15);
-- Suites in summer

-- Insert seasonal rates (winter holiday period)
INSERT INTO seasonal_rate (room_type_id, start_date, end_date, rate_multiplier)
VALUES (1, '2025-12-15', '2026-01-05', 1.30), -- Singles during holidays
       (2, '2025-12-15', '2026-01-05', 1.25), -- Doubles during holidays
       (3, '2025-12-15', '2026-01-05', 1.20);
-- Suites during holidays

-- Insert services
INSERT INTO service (service_name, base_price, is_external)
VALUES ('Restaurant', 35.00, false),
       ('LongDistance', 3.99, false),
       ('MovieRental', 9.99, false),
       ('DryClean', 25.00, true),
       ('WakeUpCall', 0.00, false),
       ('RoomService', 8.50, false);

-- Insert guests
INSERT INTO guest (first_name, last_name, email, phone, password_hash, is_account_created)
VALUES ('John', 'Doe', 'john.doe@example.com', '123-456-7890', 'hashedpassword1', TRUE),
       ('Jane', 'Smith', 'jane.smith@example.com', '234-567-8901', 'hashedpassword2', TRUE);

-- Insert reservations
INSERT INTO reservation (guest_id, room_id, staff_id, check_in_date, check_out_date, status,
                         total_amount, payment_status, payment_method, confirmation_code,
                         is_claimed)
VALUES (1, 1, 1, '2025-03-10', '2025-03-15', 'Confirmed', 500.00, 'Paid', 'Credit Card', 'CONF123',
        TRUE),
       (2, 2, 2, '2025-03-12', '2025-03-18', 'Pending', 600.00, 'Unpaid', 'Credit Card', 'CONF124',
        FALSE),
       (1, 3, 1, '2025-03-20', '2025-03-25', 'CheckedIn', 700.00, 'Paid', 'Credit Card', 'CONF125',
        TRUE),
       (2, 4, 2, '2025-03-22', '2025-03-27', 'Cancelled', 800.00, 'Unpaid', 'Credit Card',
        'CONF126', FALSE);