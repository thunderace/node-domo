-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb2+deb7u8
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 12, 2018 at 03:54 PM
-- Server version: 5.5.58
-- PHP Version: 5.4.45-0+deb7u11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `teleinfo`
--

-- --------------------------------------------------------

--
-- Table structure for table `papp_inst`
--

CREATE TABLE IF NOT EXISTS `papp_inst` (
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ID_UNIQUE` tinyint(1) NOT NULL DEFAULT '1',
  `PAPP_INST` int(5) DEFAULT '-1',
  PRIMARY KEY (`time`),
  UNIQUE KEY `ID_UNIQUE` (`ID_UNIQUE`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `teleinfo`
--

CREATE TABLE IF NOT EXISTS `teleinfo` (
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `OPTARIF` varchar(4) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
  `ISOUSC` tinyint(2) DEFAULT '0',
  `BASE` varchar(20) DEFAULT NULL,
  `IINST` tinyint(3) DEFAULT '0',
  `IMAX` tinyint(3) DEFAULT '0',
  `PAPP` int(5) DEFAULT '0',
  UNIQUE KEY `time` (`time`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
