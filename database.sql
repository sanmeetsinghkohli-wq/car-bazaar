-- ============================================================
-- Car Bazaar - Relational schema (MySQL)
-- Credentials assumed for local dev:  user: root   password: root
--
--   mysql -u root -proot < database.sql
--
-- Mirrors the structure in data/database.json so the marketplace
-- can be migrated from the flat JSON store to a SQL backend.
-- ============================================================

CREATE DATABASE IF NOT EXISTS car_bazaar
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE car_bazaar;

-- ---------- Cars ----------
DROP TABLE IF EXISTS cars;
CREATE TABLE cars (
  id            VARCHAR(20)  NOT NULL PRIMARY KEY,
  make          VARCHAR(60)  NOT NULL,
  model         VARCHAR(60)  NOT NULL,
  year          SMALLINT     NOT NULL,
  price         INT          NOT NULL,           -- AED
  mileage       VARCHAR(30)  NOT NULL,
  source        VARCHAR(60)  NOT NULL,
  is_auction    BOOLEAN      NOT NULL DEFAULT FALSE,
  current_bid   INT          NOT NULL DEFAULT 0,
  ppi_score     TINYINT      NOT NULL,
  ppi_status    VARCHAR(30)  NOT NULL,
  ppi_engine    VARCHAR(255) NOT NULL,
  ppi_chassis   VARCHAR(255) NOT NULL,
  ppi_electronics VARCHAR(255) NOT NULL,
  image         VARCHAR(120) NOT NULL,
  CONSTRAINT chk_year CHECK (year BETWEEN 2000 AND 2026),
  CONSTRAINT chk_ppi  CHECK (ppi_score BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- ---------- Testimonials ----------
DROP TABLE IF EXISTS testimonials;
CREATE TABLE testimonials (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(80)  NOT NULL,
  role     VARCHAR(40)  NOT NULL,
  rating   TINYINT      NOT NULL DEFAULT 5,
  comment  TEXT         NOT NULL
) ENGINE=InnoDB;

-- ---------- Awards ----------
DROP TABLE IF EXISTS awards;
CREATE TABLE awards (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  year   SMALLINT     NOT NULL,
  title  VARCHAR(150) NOT NULL,
  body   VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- ---------- PPI bookings / form submissions ----------
DROP TABLE IF EXISTS ppi_bookings;
CREATE TABLE ppi_bookings (
  id            VARCHAR(30) NOT NULL PRIMARY KEY,
  request_type  VARCHAR(30) NOT NULL,            -- sell | trade-in | viewing
  name          VARCHAR(80) NOT NULL,
  email         VARCHAR(120) NOT NULL,
  phone         VARCHAR(30) NOT NULL,
  car_make      VARCHAR(60),
  car_model     VARCHAR(60),
  car_year      SMALLINT,
  message       TEXT,
  submitted_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Seed data ----------
INSERT INTO cars (id, make, model, year, price, mileage, source, is_auction, current_bid,
                  ppi_score, ppi_status, ppi_engine, ppi_chassis, ppi_electronics, image) VALUES
('car_001','Toyota','Supra',2022,185000,'24,000 km','Dubizzle',TRUE,185500,94,'Excellent',
  '96% - Pristine physical state, no leaks detected','100% - Factory original frame, zero accidents','90% - Minor media display software patch available','images/supra.jpg'),
('car_002','Nissan','GT-R',2021,415000,'18,500 km','YallaMotor',TRUE,417000,91,'Excellent',
  '92% - Turbo system healthy, recent service done','95% - One panel repainted, structurally sound','88% - All driver aids functional, one sensor flagged','images/gtr.jpg'),
('car_003','BMW','M4 Competition',2023,365000,'9,200 km','Dubizzle',FALSE,0,97,'Excellent',
  '98% - As-new condition, full BMW service history','99% - Untouched factory frame','95% - All systems nominal, latest firmware','images/m4.jpg'),
('car_004','Mercedes-Benz','C200 AMG Line',2020,142000,'41,000 km','CarSwitch',FALSE,0,84,'Good',
  '86% - Healthy, minor oil seep monitored','88% - Two minor cosmetic dents, frame intact','78% - Reverse camera intermittent, repair quoted','images/c200.jpg'),
('car_005','Porsche','911 Carrera',2022,615000,'12,800 km','Dubizzle',FALSE,0,96,'Excellent',
  '97% - Flawless, dealer maintained','98% - Original frame, no accident history','93% - PCM fully functional, all options working','images/911.jpg'),
('car_006','Ford','Mustang GT',2019,118000,'55,000 km','YallaMotor',FALSE,0,79,'Good',
  '82% - Strong V8, due for spark plugs','80% - Curb rash on wheels, frame solid','74% - SYNC unit lags, one airbag light cleared','images/mustang.jpg'),
('car_007','Audi','RS5',2021,298000,'27,400 km','CarSwitch',FALSE,0,89,'Excellent',
  '91% - Excellent compression across cylinders','90% - Clean frame, professional detailing done','86% - Virtual cockpit perfect, minor USB fault','images/rs5.jpg'),
('car_008','Lexus','RX 350',2020,165000,'48,000 km','Dubizzle',FALSE,0,87,'Good',
  '90% - Reliable, full Lexus service record','88% - Minor bumper scuff, frame original','83% - Infotainment responsive, one parking sensor weak','images/rx350.jpg');

INSERT INTO testimonials (name, role, rating, comment) VALUES
('Sarah Ahmed','Trader',5,'Traded my hatchback for an SUV in an hour. The verified PPI reports gave me complete peace of mind!'),
('Omar Farouk','Buyer',5,'The PPI breakdown caught an issue the seller never mentioned. Saved me thousands. Genuinely transparent.'),
('Priya Nair','Seller',4,'Listed my car and had a verified buyer viewing within two days. The escrow simulator made the trade-in math effortless.'),
('Khalid Al Mansoori','Buyer',5,'The live auction ticker is addictive. Won my GT-R at a fair price and the inspection score was spot on.');

INSERT INTO awards (year, title, body) VALUES
(2025,'Best Automotive Marketplace - UAE','Gulf Auto Excellence Awards'),
(2024,'Innovation in Vehicle Inspection Technology','MENA Mobility Summit'),
(2024,'Consumer Trust Seal - Pre-Owned Vehicles','Emirates Consumer Protection Council'),
(2023,'Top Emerging Auto-Tech Startup','Dubai Future Foundation');
