-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2021 at 06:35 PM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 7.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tss_car`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`) VALUES
(11, 'ravikumar', 'admin@gmail.com', 'admin123');

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int(50) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Department` varchar(50) NOT NULL,
  `Hall` varchar(50) NOT NULL,
  `Purpose` varchar(50) NOT NULL,
  `sdate` date NOT NULL,
  `edate` date NOT NULL,
  `stime` varchar(50) NOT NULL,
  `etime` varchar(50) NOT NULL,
  `Admin` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `log`
--

INSERT INTO `log` (`id`, `Name`, `Department`, `Hall`, `Purpose`, `sdate`, `edate`, `stime`, `etime`, `Admin`) VALUES
(13, 'Nawin', 'Mechanical', 'conference', 'Project Review', '2021-12-18', '2021-12-18', '01:00 PM', '05:00 PM', 'Approved'),
(32, 'Ravikumar', 'IT', 'Mixed signal Oscilloscope', 'Working', '2021-12-25', '2021-12-25', '06:00 PM', '09:00 PM', 'Approved'),
(42, 'Jeswin ', 'IT', 'conference', 'Video Conferencing', '2021-12-24', '2021-12-24', '03:00 PM', '07:00 PM', 'none'),
(59, 'Harish', 'IT', 'conference', 'Project Review', '2021-12-28', '2021-12-28', '03:00 PM', '06:00 PM', 'none'),
(69, 'Harish', 'IT', 'conference', 'Video Conferencing', '2021-12-17', '2021-12-17', '12:00 PM', '04:00 PM', 'none'),
(80, 'Sanjaykumar', 'IT', 'cds', 'Video Conferencing', '2021-12-27', '2021-12-27', '12:00 PM', '02:00 PM', 'none'),
(81, 'Harish', 'IT', 'CNC Lathe', 'Working', '2021-12-25', '2021-12-25', '09:00 AM', '04:00 PM', 'Not Approved'),
(90, 'Ravikumar', 'IT', 'conference', 'Working', '2021-12-17', '2021-12-17', '12:00 PM', '04:00 PM', 'none'),
(92, 'Ravikumar', 'CSE', 'Display Center', 'Project Review', '2021-12-18', '2021-12-18', '01:00 PM', '04:00 PM', 'Approved'),
(97, 'Nawin', 'Mechanical', 'First Floor', 'Teaching', '2021-12-17', '2021-12-17', '04:00 PM', '05:00 PM', 'Approved'),
(403, 'Harish', 'IT', 'First Floor', 'Teaching', '2021-12-22', '2021-12-22', '03:00 PM', '06:00 PM', 'none'),
(791, 'Ajay', 'IT', 'First Floor', 'Teaching', '2021-12-26', '2021-12-26', '03:00 PM', '05:00 PM', 'none'),
(820, 'Harish', 'IT', 'Ground Floor', 'Teaching', '2021-12-20', '2021-12-20', '01:00 PM', '04:00 PM', 'none'),
(908, 'Harish', 'IT', 'Ground Floor', 'Teaching', '2021-12-26', '2021-12-26', '12:00 PM', '03:00 PM', 'none'),
(946, 'Harish', 'IT', 'Ground Floor', 'Teaching', '2021-11-14', '2021-11-14', '12:00 PM', '06:00 PM', 'none');

-- --------------------------------------------------------

--
-- Table structure for table `user_reg`
--

CREATE TABLE `user_reg` (
  `id` int(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `dept` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `c_password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user_reg`
--

INSERT INTO `user_reg` (`id`, `name`, `dept`, `email`, `password`, `c_password`) VALUES
(32, 'Harish', 'IT', 'harishjeyabalan69@gmail.com', '', '$2a$10$ytkyp6FjNiJ.UYHAoZPsNOE/bQA0zO/U9xjVh9bFIucctv0kXVOje'),
(33, 'Ajay', 'IT', 'mailtoajay07@gmail.com', '$2a$10$sfcJth.w15W7n3AesD0h7.O04Smc4aP7z8DgEIr5E/zLNvDHWLMoa', '$2a$10$sfcJth.w15W7n3AesD0h7.O04Smc4aP7z8DgEIr5E/zLNvDHWLMoa'),
(34, 'Ravikumar', 'IT', 'ravi@student.tce.edu', '', '$2a$10$P0SQEqIr5YDJFOV34Lj7H.z0D9YxJQ4uvTrPOWRPTBv7ItHvnu5dC'),
(35, 'Madhavan', 'IT', 'madhavanr@student.tce.edu', '', '$2a$10$ZfxLjU4XXn56iT3mDE7ws.Y2mQOHN69zCKFHXXftZlsFd42z8bu8S');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_reg`
--
ALTER TABLE `user_reg`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_reg`
--
ALTER TABLE `user_reg`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
