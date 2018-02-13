-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb2+deb7u8
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 12, 2018 at 03:53 PM
-- Server version: 5.5.58
-- PHP Version: 5.4.45-0+deb7u11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `domo`
--

-- --------------------------------------------------------

--
-- Table structure for table `arduino`
--

CREATE TABLE IF NOT EXISTS `arduino` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dispositif` varchar(100) NOT NULL,
  `evenement` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT AUTO_INCREMENT=9682 ;

-- --------------------------------------------------------

--
-- Table structure for table `mesure`
--

CREATE TABLE IF NOT EXISTS `mesure` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nom` varchar(40) DEFAULT NULL,
  `valeur1` decimal(10,2) DEFAULT NULL,
  `valeur2` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT AUTO_INCREMENT=9497 ;

-- --------------------------------------------------------

--
-- Table structure for table `mqtt`
--

CREATE TABLE IF NOT EXISTS `mqtt` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `topic` varchar(100) DEFAULT NULL,
  `payload` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT AUTO_INCREMENT=209546 ;

-- --------------------------------------------------------

--
-- Table structure for table `security`
--

CREATE TABLE IF NOT EXISTS `security` (
  `camera` int(11) DEFAULT NULL,
  `filename` char(80) NOT NULL,
  `frame` int(11) DEFAULT NULL,
  `file_type` int(11) DEFAULT NULL,
  `time_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `text_event` char(40) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `variable`
--

CREATE TABLE IF NOT EXISTS `variable` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nom` varchar(100) DEFAULT NULL,
  `valeur` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `xpl`
--

CREATE TABLE IF NOT EXISTS `xpl` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(100) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `cible` varchar(100) DEFAULT NULL,
  `classe` varchar(100) DEFAULT NULL,
  `contenu` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT AUTO_INCREMENT=197 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
