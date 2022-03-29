ALTER DATABASE `ez-market-place`
	CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE `ez-market-place`.`pipeline_templates`
	COLLATE='utf8mb4_general_ci',
	CHANGE COLUMN `uid` `uid` CHAR(40) NOT NULL FIRST,
	CHANGE COLUMN `publisher_uid` `publisher_uid` CHAR(40) NULL DEFAULT NULL AFTER `modified`,
	CHANGE COLUMN `name` `name` VARCHAR(50) NULL DEFAULT NULL AFTER `publisher_uid`,
	CHANGE COLUMN `readmeMarkdown` `readmeMarkdown` LONGTEXT NULL DEFAULT NULL COMMENT 'Readme content, encoded in Markdown' AFTER `name`,
	CHANGE COLUMN `iconPicture` `iconPicture` LONGTEXT NULL DEFAULT NULL AFTER `readmeMarkdown`,
	CHANGE COLUMN `collection_configuration` `collection_configuration` LONGTEXT NULL DEFAULT NULL AFTER `iconPicture`,
	CHANGE COLUMN `mapping_configuration` `mapping_configuration` LONGTEXT NULL DEFAULT NULL AFTER `collection_configuration`,
	CHANGE COLUMN `stats` `stats` LONGTEXT NULL DEFAULT NULL AFTER `mapping_configuration`;


ALTER TABLE `ez-market-place`.`messages`
	COLLATE='utf8mb4_general_ci',
	CHANGE COLUMN `uid` `uid` CHAR(40) NOT NULL DEFAULT uuid() FIRST,
	CHANGE COLUMN `recipient_Uid` `recipient_Uid` CHAR(40) NULL DEFAULT NULL AFTER `updated_On`,
	CHANGE COLUMN `sender_Uid` `sender_Uid` CHAR(40) NULL DEFAULT NULL AFTER `recipient_Uid`,
	CHANGE COLUMN `message` `message` VARCHAR(4096) NULL DEFAULT NULL AFTER `status`,
	CHANGE COLUMN `flags` `flags` VARCHAR(4096) NULL DEFAULT '[]' AFTER `message`;


ALTER TABLE `ez-market-place`.`publishers`
	COLLATE='utf8mb4_general_ci',
	CHANGE COLUMN `uid` `uid` CHAR(40) NOT NULL FIRST,
	CHANGE COLUMN `display_name` `display_name` VARCHAR(200) NOT NULL DEFAULT '' AFTER `uid`;

ALTER TABLE `ez-market-place`.`statistics`
	COLLATE='utf8mb4_general_ci',
	CHANGE COLUMN `uid` `uid` CHAR(40) NOT NULL DEFAULT uuid() FIRST,
	CHANGE COLUMN `deployment_uid` `deployment_uid` CHAR(40) NOT NULL AFTER `date`,
	CHANGE COLUMN `publisher_uid` `publisher_uid` CHAR(40) NOT NULL AFTER `deployment_master_id`,
	CHANGE COLUMN `server_version` `server_version` VARCHAR(20) NULL DEFAULT NULL AFTER `count`,
	CHANGE COLUMN `client_version` `client_version` VARCHAR(20) NULL DEFAULT NULL AFTER `server_version`;


ALTER TABLE `ez-market-place`.`statuses`
	COLLATE='utf8mb4_general_ci',
	CHANGE COLUMN `name` `name` VARCHAR(50) NOT NULL DEFAULT '' AFTER `id`,
	CHANGE COLUMN `description` `description` VARCHAR(500) NULL DEFAULT '' AFTER `name`;
