CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;

CREATE TABLE doctors (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text UNIQUE NOT NULL,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  image            text,
  location         text,
  skills           text[],
  field            text NOT NULL,
  phone_number     text,
  about            text,
  password_hash    text NOT NULL,
  created_at       timestamp DEFAULT now(),
  updated_at       timestamp DEFAULT now()
);

CREATE TABLE patients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name        text NOT NULL,
  email            text UNIQUE NOT NULL,
  password_hash    text NOT NULL,
  created_at       timestamp DEFAULT now(),
  updated_at       timestamp DEFAULT now()
);

CREATE TABLE appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id        uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id       uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  description      text,
  date             date NOT NULL,
  time             time NOT NULL,
  status           text NOT NULL CHECK (status IN ('pending','confirmed','rejected')) DEFAULT 'pending',
  created_at       timestamp DEFAULT now(),
  updated_at       timestamp DEFAULT now(),
  UNIQUE (doctor_id, date, time)
);

CREATE TABLE doctor_availability (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id        uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  weekday          int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  slot_minutes     int NOT NULL DEFAULT 30,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamp DEFAULT now(),
  updated_at       timestamp DEFAULT now()
);

CREATE INDEX ON appointments (doctor_id, date);
CREATE INDEX ON doctor_availability (doctor_id, weekday);
