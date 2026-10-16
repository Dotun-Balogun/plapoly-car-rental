-- Sample fleet so the app is not empty on first run.
-- Rates are per day in Naira. Edit or delete these from the admin dashboard.
insert into public.vehicles
  (registration_no, brand, model, year, type, color, seats, transmission, fuel, rate, description)
values
  ('KJA-214-AB', 'Toyota', 'Corolla',     2021, 'sedan',     'Silver', 5, 'automatic', 'petrol', 45000,  'Reliable and fuel-efficient. A smart choice for city trips and daily errands.'),
  ('ABC-532-DE', 'Toyota', 'Camry',       2022, 'sedan',     'Black',  5, 'automatic', 'petrol', 60000,  'Roomy, smooth and comfortable for long drives and business travel.'),
  ('LND-871-FG', 'Honda',  'Accord',      2020, 'sedan',     'White',  5, 'automatic', 'petrol', 55000,  'Comfortable sedan with generous boot space and a quiet cabin.'),
  ('GWA-309-HK', 'Kia',    'Rio',         2021, 'hatchback', 'Red',    5, 'manual',    'petrol', 35000,  'Compact and easy to park. Great value for getting around town.'),
  ('PLT-648-JM', 'Toyota', 'Highlander',  2022, 'suv',       'Blue',   7, 'automatic', 'petrol', 95000,  'Seven seats and plenty of luggage space for family trips and group travel.'),
  ('ABJ-117-NP', 'Lexus',  'RX 350',      2021, 'luxury',    'Grey',   5, 'automatic', 'petrol', 150000, 'Premium comfort and a refined drive for weddings, events and executive travel.'),
  ('KAN-950-RS', 'Toyota', 'Hilux',       2022, 'pickup',    'White',  5, 'manual',    'diesel', 85000,  'Tough and capable. Built for rough roads and heavy loads.'),
  ('EKY-426-TU', 'Toyota', 'Hiace Bus',   2020, 'bus',       'White', 14, 'manual',    'petrol', 120000, 'Fourteen seats with air conditioning. Ideal for groups, events and airport runs.'),
  ('LAG-703-VW', 'Mercedes-Benz', 'E-Class', 2021, 'luxury', 'Black',  5, 'automatic', 'petrol', 180000, 'Top-tier luxury for VIP travel, weddings and special occasions.');
