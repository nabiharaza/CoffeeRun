-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    group_id INTEGER,
    user_id INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    group_id INTEGER,
    paid_by INTEGER,
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE expense_items (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER,
    user_id INTEGER,
    amount REAL NOT NULL,
    description TEXT,
    FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_debts (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    debtor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creditor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert users
INSERT INTO users (name, email) VALUES
('Jim Wilson', 'jim.wilson@example.com'),
('Bob Smith', 'bob.smith@example.com'),
('Nabiha Raza', 'nabiha.raza@example.com'),
('Ali Jabir', 'ali.jabir@example.com'),
('Shafia Shahid', 'shafia.shahid@example.com'),
('Zain Raza', 'zain.raza@example.com'),
('Rani Chatterjee', 'rani.chatterjee@example.com'),
('Emma Johnson', 'emma.johnson@example.com'),
('Michael Brown', 'michael.brown@example.com'),
('Sarah Lee', 'sarah.lee@example.com'),
('David Kim', 'david.kim@example.com'),
('Priya Patel', 'priya.patel@example.com');

-- Insert coffee-related groups
INSERT INTO groups (name, description) VALUES
('Office Coffee Club', 'Daily coffee runs at work'),
('Weekend Coffee Tasting', 'Exploring local coffee shops on weekends'),
('Home Barista Group', 'Sharing home brewing equipment and beans'),
('Coffee Bean Buyers Club', 'Bulk purchases of specialty beans'),
('Latte Art Enthusiasts', 'Practicing and learning latte art techniques');

-- Office Coffee Club (Jim, Bob, Ali, Sarah, David)
INSERT INTO group_members (group_id, user_id) VALUES
(1, 1), (1, 2), (1, 4), (1, 10), (1, 11);

-- Weekend Coffee Tasting (Nabiha, Shafia, Zain, Rani, Emma)
INSERT INTO group_members (group_id, user_id) VALUES
(2, 3), (2, 5), (2, 6), (2, 7), (2, 8);

-- Home Barista Group (Ali, Michael, Sarah, Priya)
INSERT INTO group_members (group_id, user_id) VALUES
(3, 4), (3, 9), (3, 10), (3, 12);

-- Coffee Bean Buyers Club (Bob, Nabiha, Emma, David)
INSERT INTO group_members (group_id, user_id) VALUES
(4, 2), (4, 3), (4, 8), (4, 11);

-- Latte Art Enthusiasts (Shafia, Zain, Rani, Priya)
INSERT INTO group_members (group_id, user_id) VALUES
(5, 5), (5, 6), (5, 7), (5, 12);

-- Monday Coffee Run (paid by Jim)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(1, 1, 'Monday Morning Coffee', '2023-06-05 08:30:00');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(1, 1, 4.50, 'Americano'),
(1, 2, 4.50, 'Cappuccino'),
(1, 4, 5.00, 'Latte with syrup'),
(1, 10, 4.50, 'Americano'),
(1, 11, 5.00, 'Mocha');

-- Friday Special (paid by Sarah)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(1, 10, 'Friday Treat', '2023-06-09 09:15:00');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(2, 1, 6.00, 'Iced Coffee'),
(2, 2, 6.50, 'Caramel Macchiato'),
(2, 4, 6.50, 'Vanilla Latte'),
(2, 10, 5.50, 'Cold Brew'),
(2, 11, 6.00, 'Iced Mocha');


-- Artisan Coffee Shop Visit (paid by Nabiha)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(2, 3, 'Downtown Coffee Experience', '2023-06-10 11:00:00');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(3, 3, 8.00, 'Ethiopian Pour Over'),
(3, 5, 7.50, 'Flat White'),
(3, 6, 8.50, 'Turkish Coffee'),
(3, 7, 7.00, 'Cortado'),
(3, 8, 9.00, 'Geisha Specialty');

-- Coffee Tasting Flight (paid by Shafia)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(2, 5, 'Tasting Flight', '2023-06-17 14:00:00');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(4, 3, 12.00, 'Flight share'),
(4, 5, 12.00, 'Flight share'),
(4, 6, 12.00, 'Flight share'),
(4, 7, 12.00, 'Flight share'),
(4, 8, 12.00, 'Flight share');

-- Premium Coffee Beans (paid by Ali)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(3, 4, 'Jamaican Blue Mountain', '2023-06-01');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(5, 4, 25.00, 'Bean share'),
(5, 9, 25.00, 'Bean share'),
(5, 10, 25.00, 'Bean share'),
(5, 12, 25.00, 'Bean share');

-- Milk Frother (paid by Michael)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(3, 9, 'Professional Milk Frother', '2023-06-15');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(6, 4, 30.00, 'Equipment share'),
(6, 9, 30.00, 'Equipment share'),
(6, 10, 30.00, 'Equipment share'),
(6, 12, 30.00, 'Equipment share');


-- Bulk Ethiopian Yirgacheffe (paid by Bob)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(4, 2, '5kg Ethiopian Beans', '2023-06-05');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(7, 2, 35.00, 'Bean share'),
(7, 3, 35.00, 'Bean share'),
(7, 8, 35.00, 'Bean share'),
(7, 11, 35.00, 'Bean share');

-- Colombian Supremo (paid by Emma)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(4, 8, '3kg Colombian Beans', '2023-06-20');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(8, 2, 28.00, 'Bean share'),
(8, 3, 28.00, 'Bean share'),
(8, 8, 28.00, 'Bean share'),
(8, 11, 28.00, 'Bean share');


-- Latte Art Workshop (paid by Shafia)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(5, 5, 'Professional Workshop', '2023-06-11');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(9, 5, 50.00, 'Workshop fee'),
(9, 6, 50.00, 'Workshop fee'),
(9, 7, 50.00, 'Workshop fee'),
(9, 12, 50.00, 'Workshop fee');

-- Practice Milk (paid by Priya)
INSERT INTO expenses (group_id, paid_by, description, date) VALUES
(5, 12, 'Organic Whole Milk', '2023-06-18');

INSERT INTO expense_items (expense_id, user_id, amount, description) VALUES
(10, 5, 8.00, 'Milk share'),
(10, 6, 8.00, 'Milk share'),
(10, 7, 8.00, 'Milk share'),
(10, 12, 8.00, 'Milk share');