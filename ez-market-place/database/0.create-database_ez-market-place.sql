-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.6.5-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for ez-market-place
CREATE DATABASE IF NOT EXISTS `ez-market-place` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `ez-market-place`;

-- Dumping structure for table ez-market-place.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `uid` char(40) NOT NULL DEFAULT uuid(),
  `sent_On` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_On` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `recipient_Uid` char(40) DEFAULT NULL,
  `sender_Uid` char(40) DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT 5,
  `message` varchar(4096) DEFAULT NULL,
  `flags` varchar(4096) DEFAULT '[]',
  PRIMARY KEY (`uid`),
  KEY `status` (`status`),
  KEY `sentOn` (`sent_On`) USING BTREE,
  KEY `recipientUid` (`recipient_Uid`) USING BTREE,
  KEY `senderUid` (`sender_Uid`) USING BTREE,
  CONSTRAINT `FK_messages_publishers` FOREIGN KEY (`recipient_Uid`) REFERENCES `publishers` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_messages_publishers_2` FOREIGN KEY (`sender_Uid`) REFERENCES `publishers` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_messages_statuses` FOREIGN KEY (`status`) REFERENCES `statuses` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table ez-market-place.messages: ~7 rows (approximately)

-- Dumping structure for table ez-market-place.pipeline_templates
CREATE TABLE IF NOT EXISTS `pipeline_templates` (
  `uid` char(40) NOT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT 1,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `publisher_uid` char(40) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
	`readmeMarkdown` LONGTEXT NULL DEFAULT NULL,
	`iconPicture` LONGTEXT NULL DEFAULT NULL,
  `collection_configuration` longtext DEFAULT NULL,
  `mapping_configuration` longtext DEFAULT NULL,
  `stats` longtext DEFAULT NULL,
  PRIMARY KEY (`uid`),
  KEY `status` (`status`),
  KEY `FK_pipeline_templates_publishers` (`publisher_uid`),
  CONSTRAINT `FK_pipeline_templates_publishers` FOREIGN KEY (`publisher_uid`) REFERENCES `publishers` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_pipeline_templates_statuses` FOREIGN KEY (`status`) REFERENCES `statuses` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table ez-market-place.pipeline_templates: ~11 rows (approximately)

-- Dumping structure for table ez-market-place.publishers
CREATE TABLE IF NOT EXISTS `publishers` (
  `uid` char(40) NOT NULL,
  `display_name` varchar(200) NOT NULL DEFAULT '',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `display_name` (`display_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table ez-market-place.publishers: ~3 rows (approximately)

-- Dumping structure for table ez-market-place.statuses
CREATE TABLE IF NOT EXISTS `statuses` (
  `id` tinyint(4) unsigned NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '',
  `description` varchar(500) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table ez-market-place.statuses: ~7 rows (approximately)
/*!40000 ALTER TABLE `statuses` DISABLE KEYS */;
INSERT IGNORE INTO `statuses` (`id`, `name`, `description`) VALUES
	(0, 'Visible', 'The item is publicly visible'),
	(1, 'Pending review', 'The item is to be reviewed'),
	(2, 'Failed Review', 'The item has been reviewed negatively'),
	(3, 'Hidden', 'The item is hidden'),
	(4, 'To be deleted', 'The item is flag for deletion'),
	(5, 'Unread', 'The item is marked as Not Read'),
	(6, 'Read', 'The item is marked as Read');
/*!40000 ALTER TABLE `statuses` ENABLE KEYS */;

--
-- Create table `statistics`
--
CREATE TABLE IF NOT EXISTS statistics (
  uid CHAR(40) NOT NULL DEFAULT uuid(),
  date DATE NOT NULL DEFAULT current_timestamp,
  deployment_uid CHAR(40) NOT NULL,
  deployment_master_id INT(11) NOT NULL,
  publisher_uid CHAR(40) NOT NULL,
  count INT(11) NOT NULL DEFAULT 0,
  server_version VARCHAR(20) DEFAULT NULL,
  client_version VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (date, deployment_uid, publisher_uid, deployment_master_id)
)
ENGINE = INNODB,
AVG_ROW_LENGTH = 226,
CHARACTER SET utf8mb4,
COLLATE utf8mb4_general_ci;

--
-- Create index `deploymentUid` on table `statistics`
--
ALTER TABLE statistics 
  ADD INDEX deploymentUid(deployment_uid);

--
-- Create index `publisherUid` on table `statistics`
--
ALTER TABLE statistics 
  ADD INDEX publisherUid(publisher_uid);

--
-- Create index `masterId` on table `statistics`
--
ALTER TABLE statistics 
  ADD INDEX masterId(deployment_master_id);

--
-- Create index `server_version` on table `statistics`
--
ALTER TABLE statistics 
  ADD INDEX server_version(server_version);

--
-- Create index `client_version` on table `statistics`
--
ALTER TABLE statistics 
  ADD INDEX client_version(client_version);


--
-- Create table `aka_redirections`
--

CREATE TABLE IF NOT EXISTS `aka_redirections` (
	`uid` CHAR(40) NOT NULL DEFAULT uuid() COLLATE 'utf8mb4_general_ci',
	`short_path` VARCHAR(1024) NOT NULL DEFAULT uuid() COLLATE 'utf8mb4_general_ci',
	`target_server` VARCHAR(2048) NOT NULL DEFAULT 'https://docs.logrhythm.com' COLLATE 'utf8mb4_general_ci',
	`target_path` VARCHAR(4096) NOT NULL DEFAULT '/docs' COLLATE 'utf8mb4_general_ci',
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	`status` TINYINT(4) UNSIGNED NOT NULL DEFAULT 0,
	PRIMARY KEY (`uid`),
  KEY `status` (`status`),
	UNIQUE INDEX `short_path` (`short_path`),
  CONSTRAINT `FK_aka_redirections_statuses` FOREIGN KEY (`status`) REFERENCES `ez-market-place`.`statuses` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
;


/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table ez-market-place.aka_redirections: ~3 rows (approximately)
/*!40000 ALTER TABLE `aka_redirections` DISABLE KEYS */;
INSERT IGNORE INTO `aka_redirections` (`uid`, `short_path`, `target_server`, `target_path`, `created`, `modified`, `status`) VALUES
	('aab13e80-6e5c-11ed-ab7f-000c29f38390', 'OCAdminErrorMessages-nolivesocket', 'https://docs.logrhythm.com', '/docs/OCbeats/logrhythm-open-collector/oc-admin/oc-admin-error-messages#OCAdminErrorMessages-nolivesocket', '2023-01-13 14:23:06', '2023-01-13 14:47:05', 0),
	('d1c2d213-6e5f-11ed-ab7f-000c29f38390', 'OCAdminHelp-ref-whatsthedifferencefieldmappingshareimport', 'https://docs.logrhythm.com', '/docs/OCbeats/logrhythm-open-collector/oc-admin/oc-admin-user-guide/oc-admin-pipelines/oc-admin-mapping-editor#OCAdminMappingEditor-sharing-importing-fields-mapping', '2023-01-13 14:45:39', '2023-01-13 14:45:40', 0),
	('deb26e8d-6e5e-11ed-ab7f-000c29f38390', 'OCAdminHelp-ref-whatsthedifferencecollectionconfigurationshareimport', 'https://docs.logrhythm.com', '/docs/OCbeats/logrhythm-open-collector/oc-admin/oc-admin-user-guide/oc-admin-pipelines/oc-admin-collection-configuration#OCAdminCollectionConfiguration-sharing-importing-collection-configuration', '2023-01-13 14:38:52', '2023-01-13 14:40:26', 0);
/*!40000 ALTER TABLE `aka_redirections` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
