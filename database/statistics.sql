-- phpMyAdmin SQL Dump
-- version 4.4.14
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 27, 2018 at 01:58 AM
-- Server version: 5.7.17
-- PHP Version: 5.6.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shopgo_statistics`
--

-- --------------------------------------------------------

--
-- Table structure for table `currency_exchange`
--

CREATE TABLE IF NOT EXISTS `currency_exchange` (
  `id` int(11) NOT NULL,
  `currency_code` varchar(10) NOT NULL,
  `exchange_rate` double NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `currency_exchange`
--

INSERT INTO `currency_exchange` (`id`, `currency_code`, `exchange_rate`, `last_update`) VALUES
(1, 'JOD', 0.7086, '2015-12-21 23:11:25'),
(2, 'GBP', 0.671, '2015-12-21 23:24:59'),
(3, 'AED', 3.673, '2015-12-21 23:24:19');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE IF NOT EXISTS `order` (
  `id` int(10) NOT NULL,
  `store_id` int(10) NOT NULL,
  `order_id` int(10) NOT NULL,
  `customer_name` varchar(128) DEFAULT NULL,
  `customer_email` varchar(128) DEFAULT NULL,
  `subtotal` double NOT NULL DEFAULT '0',
  `total` double NOT NULL DEFAULT '0',
  `state` varchar(64) DEFAULT NULL,
  `currency` varchar(5) NOT NULL,
  `country_code` varchar(3) DEFAULT NULL,
  `payment_code` varchar(128) DEFAULT NULL,
  `payment_title` varchar(128) DEFAULT NULL,
  `shipping_method` varchar(128) DEFAULT NULL,
  `create_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id`, `store_id`, `order_id`, `customer_name`, `customer_email`, `subtotal`, `total`, `state`, `currency`, `country_code`, `payment_code`, `payment_title`, `shipping_method`, `create_date`) VALUES
(1, 126, 16, 'Heiba Heiba', 'heiba@hotmail.com', 186, 200, 'new', 'EGP', 'AE', 'payfortcc', 'Credit / Debit Card', 'aramex', '2016-11-04 05:09:28'),
(12, 126, 21, 'Heiba Heiba 2', 'heiba2@hotmail.com', 156, 150, 'new', 'EGP', 'AE', 'paypal', 'Paypal', 'aramex', '2018-11-04 03:09:28'),
(13, 126, 17, 'Heiba Heiba 3', 'heiba3@hotmail.com', 176, 170, 'new', 'EGP', 'AE', 'cod', 'Cash on delivery', 'aramex', '2018-11-04 03:09:28'),
(14, 126, 18, 'Heiba Heiba 4', 'heiba4@hotmail.com', 196, 210, 'new', 'EGP', 'AE', 'payfortcc', 'Credit / Debit Card', 'aramex', '2018-11-04 03:09:28'),
(15, 126, 19, 'Heiba Heiba 5', 'heiba5@hotmail.com', 176, 140, 'new', 'EGP', 'AE', 'payfortcc', 'Credit / Debit Card', 'ups', '2018-10-25 02:09:28'),
(16, 126, 20, 'Heiba Heiba 6', 'heiba6@hotmail.com', 156, 110, 'new', 'EGP', 'AE', 'paytabscc', 'Credit / Debit Card', 'aramex', '2018-10-04 02:09:28'),
(17, 126, 22, 'Heiba Heiba 3', 'heiba3@hotmail.com', 176, 170, 'new', 'EGP', 'JO', 'payfortcc', 'Credit / Debit Card', 'aramex', '2018-11-04 03:09:28'),
(18, 127, 23, 'Heiba Heiba 2', 'heiba2@hotmail.com', 156, 150, 'new', 'EGP', 'AE', 'cod', 'Cash on delivery', 'dhl', '2018-11-04 03:09:28'),
(19, 126, 24, 'Heiba Heiba 5', 'heiba5@hotmail.com', 176, 140, 'new', 'EGP', 'SA', 'payfortcc', 'Credit / Debit Card', 'aramex', '2018-10-25 02:09:28'),
(20, 126, 25, 'Heiba Heiba 3', 'heiba3@hotmail.com', 176, 170, 'new', 'EGP', 'AE', 'paypal', 'Paypal', 'dhl', '2018-11-04 03:09:28'),
(21, 128, 26, 'Heiba Heiba', 'heiba@hotmail.com', 186, 200, 'new', 'EGP', 'AE', 'payfortcc', 'Credit / Debit Card', 'aramex', '2016-11-04 05:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `store`
--

CREATE TABLE IF NOT EXISTS `store` (
  `id` int(10) NOT NULL,
  `title` varchar(128) NOT NULL,
  `url` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `last_update` timestamp NULL DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `store`
--

INSERT INTO `store` (`id`, `title`, `url`, `token`, `last_update`, `status`) VALUES
(126, 'Blink store', 'http://test-1.com', '099MOCRdBdvjPR58LImhYYCh', NULL, 1),
(127, 'Test store Inc.', 'http://test-2.com/', '099Pnn2nJWoTccB4Eph0i95M', NULL, 1),
(128, 'Test My store', 'http://test-3.com/', '099PnrfYjI22JubtHdSRFMIL', NULL, 1),
(133, 'test store', 'http://test-4.com', '09IercYkjCGZQnC4KiGCzRVm', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(10) NOT NULL,
  `username` varchar(128) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(128) DEFAULT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '1',
  `role_id` int(10) NOT NULL DEFAULT '-1'
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `email`, `active`, `role_id`) VALUES
(1, 'shopgo-admin', '24c05ce1409afb5dad4c5bddeb924a4bc3ea00f5', 'info@shopgo.me', 1, -1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `currency_exchange`
--
ALTER TABLE `currency_exchange`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `store_id` (`store_id`,`order_id`),
  ADD KEY `FKorder491134` (`store_id`),
  ADD KEY `currency` (`currency`),
  ADD KEY `country_code` (`country_code`),
  ADD KEY `payment_code` (`payment_code`),
  ADD KEY `shipping_method` (`shipping_method`);

--
-- Indexes for table `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `currency_exchange`
--
ALTER TABLE `currency_exchange`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=22;
--
-- AUTO_INCREMENT for table `store`
--
ALTER TABLE `store`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=134;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `FKorder491134` FOREIGN KEY (`store_id`) REFERENCES `store` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
