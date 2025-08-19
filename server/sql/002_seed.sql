-- patients
INSERT INTO patients (user_name, email, password_hash)
VALUES
  ('demo_patient', 'patient@example.com', '$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy'); -- bcrypt hash: "password" (dummy)

-- doctors (6 across 3-4 fields)
INSERT INTO doctors (first_name,last_name,email,password_hash,field,location,phone_number,about,skills,image)
VALUES
  ('Amina','El Fassi','amina@clinic.ma','$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy','Cardiology','Rabat','+212600000001','Cardiologist with 8y exp',ARRAY['ECG','Hypertension'],''),
  ('Youssef','Bennani','youssef@clinic.ma','$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy','Dermatology','Casablanca','+212600000002','Skin specialist',ARRAY['Acne','Allergy'],''),
  ('Salma','Zerhouni','salma@clinic.ma','$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy','Pediatrics','Marrakech','+212600000003','Pediatrician',ARRAY['Vaccines','Nutrition'],''),
  ('Omar','El Idrissi','omar@clinic.ma','$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy','General Medicine','Fes','+212600000004','General practitioner',ARRAY['Checkups'],''),
  ('Nadia','Cherkaoui','nadia@clinic.ma','$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy','Cardiology','Casablanca','+212600000005','Cardio specialist',ARRAY['Arrhythmia'],''),
  ('Karim','Boutayeb','karim@clinic.ma','$2b$10$0CM5tX0j3cOfxXrXk0bI6O5n2N4d8wK6a2s2z8g3oP5t4c9b2l2Zy','Dermatology','Rabat','+212600000006','Dermatologist',ARRAY['Eczema'],'')
;

-- availability Mon–Fri 09:00–16:00, 30-min slots
WITH w AS (
  SELECT unnest(ARRAY[1,2,3,4,5]) AS weekday
)
INSERT INTO doctor_availability (doctor_id, weekday, start_time, end_time, slot_minutes, is_active)
SELECT d.id, w.weekday, '09:00','16:00',30,true
FROM doctors d CROSS JOIN w;

-- sample appointments (same date today+1)
INSERT INTO appointments (doctor_id, patient_id, description, date, time, status)
SELECT d.id, (SELECT id FROM patients LIMIT 1), 'Initial check', CURRENT_DATE + INTERVAL '1 day', '10:00', 'pending'
FROM doctors d LIMIT 1;

INSERT INTO appointments (doctor_id, patient_id, description, date, time, status)
SELECT d.id, (SELECT id FROM patients LIMIT 1), 'Follow-up', CURRENT_DATE + INTERVAL '1 day', '11:00', 'confirmed'
FROM doctors d OFFSET 1 LIMIT 1;

INSERT INTO appointments (doctor_id, patient_id, description, date, time, status)
SELECT d.id, (SELECT id FROM patients LIMIT 1), 'Old request', CURRENT_DATE + INTERVAL '1 day', '12:00', 'rejected'
FROM doctors d OFFSET 2 LIMIT 1;
