INSERT INTO users (name, email, password) 
VALUES 
('Richard Oda', 'richardoda@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('Louisa Meyer', 'jacksonrose@hotmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('Dominic Parks', 'victoriablackwell@outlook.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.');

INSERT INTO properties 
(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
VALUES 
(1, 'Cabin In the Woods', 'description', 'test', 'test', 100, 2, 3, 1, 'Canada', '123', 'woods', 'BC', '3432423', 't'),
(2, 'Hilton Manor', 'description', 'test', 'test', 200, 10, 0, 10, 'Canada', 'test', 'Hill Top', 'BC', '90fds211', 't'),
(3, 'Plain Home', 'description', 'test', 'test', 300, 3, 3, 1, 'Canada', 'plainjane', 'resaf', 'BC', '90210', 't');

INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES ('2018-09-11', '2018-09-26', 1, 1),
('2019-01-04', '2019-02-01', 2, 2),
('2021-10-01', '2021-10-14', 3, 3);

INSERT INTO property_reviews (guest_id, property_id, reservation_id, rating, message) 
VALUES 
(1, 2, 3, 5, 'message'), 
(1, 3, 1, 3, 'message'), 
(2, 1, 2, 1, 'message');
