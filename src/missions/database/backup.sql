-- MySQL dump 10.13  Distrib 5.7.29, for Linux (x86_64)
--
-- Host: localhost    Database: missions
-- ------------------------------------------------------
-- Server version	5.7.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activitylogin`
--

DROP TABLE IF EXISTS `activitylogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activitylogin` (
  `activityLoginId` int(11) NOT NULL AUTO_INCREMENT,
  `activityFhirId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updatedById` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`activityLoginId`),
  KEY `updatedById` (`updatedById`),
  CONSTRAINT `activitylogin_ibfk_1` FOREIGN KEY (`updatedById`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activitylogin`
--

LOCK TABLES `activitylogin` WRITE;
/*!40000 ALTER TABLE `activitylogin` DISABLE KEYS */;
/*!40000 ALTER TABLE `activitylogin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `address` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formatted_address` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `route` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street_number` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `locality` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(10,8) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_role`
--

DROP TABLE IF EXISTS `app_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_role` (
  `roleId` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`roleId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_role`
--

LOCK TABLES `app_role` WRITE;
/*!40000 ALTER TABLE `app_role` DISABLE KEYS */;
INSERT INTO `app_role` VALUES (1,'ROLE_PATIENT','ROLE_PATIENT','1983-10-10 10:00:00','1983-10-10 10:00:00'),(2,'ROLE_ADMIN','ROLE_ADMIN','1983-10-10 10:00:00','1983-10-10 10:00:00');
/*!40000 ALTER TABLE `app_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_user`
--

DROP TABLE IF EXISTS `app_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_user` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `emailAddress` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `firstname` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastname` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `carePlanNotes` text COLLATE utf8_unicode_ci,
  `fhirId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `citizenNumber` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password_` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `uuid_` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `passwordReset` tinyint(1) DEFAULT NULL,
  `passwordModifiedDate` datetime DEFAULT NULL,
  `digest` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `reminderQueryQuestion` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `reminderQueryAnswer` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `comments` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastLoginDate` datetime DEFAULT NULL,
  `lastFailedLoginDate` datetime DEFAULT NULL,
  `failedLoginAttempts` int(11) DEFAULT NULL,
  `lockout` tinyint(1) DEFAULT NULL,
  `lockoutDate` datetime DEFAULT NULL,
  `agreedToTermsOfUse` tinyint(1) DEFAULT NULL,
  `emailAddressVerified` tinyint(1) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `shortTermPrediction` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `emailAddress` (`emailAddress`),
  UNIQUE KEY `citizenNumber` (`citizenNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_user`
--

LOCK TABLES `app_user` WRITE;
/*!40000 ALTER TABLE `app_user` DISABLE KEYS */;
INSERT INTO `app_user` VALUES (1,'admin@ocariot.com','admin','admin','admin',NULL,NULL,NULL,'$2b$10$BPF.48tRghRwLOs52.ljpOC73ZtL94brWt68tGxCphvZVpMx7sAY.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2019-07-12 09:16:13','2019-07-12 09:16:13');
/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ardenrule`
--

DROP TABLE IF EXISTS `ardenrule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ardenrule` (
  `ardenRuleId` int(11) NOT NULL AUTO_INCREMENT,
  `ruleName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ruleText` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `assessments` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `purpose` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `explanation` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `keywords` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `links` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `urgency` int(11) DEFAULT NULL,
  `msg` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ruleConditions` blob,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`ardenRuleId`),
  KEY `userId` (`userId`),
  CONSTRAINT `ardenrule_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ardenrule`
--

LOCK TABLES `ardenrule` WRITE;
/*!40000 ALTER TABLE `ardenrule` DISABLE KEYS */;
INSERT INTO `ardenrule` VALUES (1,'Never skip breakfast','Never skip breakfast','diet','Diet','D1','','',50,NULL,_binary '{\"title\":\"Never skip breakfast\",\"purpose\":\"Diet\",\"explanation\":\"D1\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain the number of days having breakfast to 7\",\"actionId\":\"df95d56e-d45d-4051-9cef-c68622b16b5d\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":4}]},{\"parameter\":{\"name\":\"D1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase the number of days having breakfast to 7\",\"actionId\":\"475b13f2-08ae-43f1-8dea-4050871a3b4e\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":4}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase the number of days having breakfast to ≥ 4\",\"actionId\":\"8fca4570-256b-424e-aff1-98a7834dcb20\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":1}',1,'2019-07-19 10:55:05','2020-01-30 08:21:01'),(2,'Increase fruit consumption','Increase fruit consumption','diet','Diet','D3','','',50,NULL,_binary '{\"title\":\"Increase fruit consumption\",\"purpose\":\"Diet\",\"explanation\":\"D3\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain fruit consumption to ≥ 3 times/day\",\"actionId\":\"ab189904-9367-4350-bf54-d87fa8d22f0b\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]},{\"parameter\":{\"name\":\"D3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase fruit consumption to ≥ 3 times/day\",\"actionId\":\"b25bd0c7-217a-408e-8c7a-50022f821614\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":0}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase fruit consumption to ≥ 1 times/day\",\"actionId\":\"ecbc7c48-3c4b-4a67-aa05-becac653fb0a\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":2}',1,'2019-07-22 15:19:40','2019-07-23 13:53:36'),(3,'Consume variety of fruits','Consume variety of fruits','education,exercise','Education','E1','','',50,NULL,_binary '{\"title\":\"Consume variety of fruits\",\"purpose\":\"Education\",\"explanation\":\"E1\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume variety of fruits (≥3) to encourage different flavors and textures\",\"actionId\":\"1845e619-b880-4c85-afcf-6ed6ac16bbbb\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume variety of fruits (≥2) to encourage different flavors and textures\",\"actionId\":\"53826bdc-bf05-498f-a456-7dc6dee14343\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Exercise\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume variety of fruits (>1) to encourage different flavors and textures\",\"actionId\":\"00e01f2b-bad9-4604-8e47-5596ad350b9e\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":3}',1,'2019-07-22 18:06:34','2020-01-27 13:16:24'),(4,'Decrease number of hours in sedentary behaviors','Decrease number of hours in sedentary behaviors','physicalactivity','Physical Activity','PA1','','',50,NULL,_binary '{\"title\":\"Decrease number of hours in sedentary behaviors\",\"purpose\":\"Physical Activity\",\"explanation\":\"PA1\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage child to maintain behaviour in screen time ≤ 1 hours/day\",\"actionId\":\"9d27d890-3654-4d5a-ba0c-a45d3d46881b\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"gt\",\"label\":\"Greater than\",\"icon\":\"assets/images/operators/greaterthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]},{\"parameter\":{\"name\":\"PA1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage child to reduce screen time to ≤ 1 hours/day\",\"actionId\":\"d7c10f84-8de5-4051-8741-a5b94d6e6205\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA1\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage child to reduce screen time to ≤ 2 hours/day\",\"actionId\":\"2cc07c21-2761-468c-97ea-782715f7250f\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":4}',1,'2019-07-22 19:18:51','2019-07-23 13:54:50'),(6,'Increase vegetable consumption','Increase vegetable consumption','diet','Diet','D4','','',50,NULL,_binary '{\"title\":\"Increase vegetable consumption\",\"purpose\":\"Diet\",\"explanation\":\"D4\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain the vegetable consumption in ≥ 2 times/day\",\"actionId\":\"3ba985ab-37fe-4aa0-9d34-c50dc7c5d075\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase vegetable consumption to ≥ 2 times/day\",\"actionId\":\"62ed92d2-1d1d-4c72-b557-656426866a82\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":0}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase vegetable consumption to ≥ 1 time/day\",\"actionId\":\"29c12c1f-a9ea-498a-90ed-f145be70494f\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":6}',1,'2019-07-23 07:33:01','2019-07-23 13:55:26'),(7,'Decrease consumption of sweets and candies (lillpoop, sugary candies, sweets of all types','Decrease consumption of sweets and candies (lillpoop, sugary candies, sweets of all types','diet','Diet','D6','','',50,NULL,_binary '{\"title\":\"Decrease consumption of sweets and candies (lillpoop, sugary candies, sweets of all types\",\"purpose\":\"Diet\",\"explanation\":\"D6\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D6\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain sweet consumption to ≤ 1 time/week\",\"actionId\":\"74a5326a-d941-4385-b41a-8bf24cbfb607\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D6\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]},{\"parameter\":{\"name\":\"D6\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce sweet consumption to ≤ 1 times/week\",\"actionId\":\"b7af7c4c-5248-4afa-9aa8-69e4bd84664f\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D6\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce sweet consumption to ≤ 3 times/week\",\"actionId\":\"2281c4f2-00d4-4342-abed-51c89d8fecc6\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":7}',1,'2019-07-23 07:41:38','2019-07-23 13:56:33'),(8,'Number of meals/day','Number of meals/day','education','Education','E3','','',50,NULL,_binary '{\"title\":\"Number of meals/day\",\"purpose\":\"Education\",\"explanation\":\"E3\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":4}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain at least 4 daily intakes. Reinforce the importance\",\"actionId\":\"1e79463f-e553-4e2c-861b-05fb503fa5eb\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase the number of meals/day to at least 4: Introduce some food at recess, in the afternoon\",\"actionId\":\"e3389148-3d5e-4f47-8e71-f33a7945ccb2\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase the number of meals/day to at least 3\",\"actionId\":\"25f0cc53-2792-45f2-9cd1-49f55779d71d\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":8}',1,'2019-07-23 07:53:38','2019-07-23 13:57:19'),(9,'Practice ACTIVE activities at recess','Practice ACTIVE activities at recess','physicalactivity','Physical Activity','PA2','','',50,NULL,_binary '{\"title\":\"Practice ACTIVE activities at recess\",\"purpose\":\"Physical Activity\",\"explanation\":\"PA2\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA2\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":4}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain active games at recess for ≥ 4 times/week\",\"actionId\":\"9dfe3920-abb2-4a15-b0ea-0f521057f253\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA2\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase the frequency of active games at recess to ≥ 2 times/week\",\"actionId\":\"20ea0421-da40-4c6b-8d55-a238e1bdd17d\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":9}',1,'2019-07-23 08:09:06','2020-01-17 14:56:09'),(10,'Increase the duration and frequency of physical activity','Increase the duration and frequency of physical activity','physicalactivity','Physical Activity','PA3','','',50,NULL,_binary '{\"title\":\"Increase the duration and frequency of physical activity\",\"purpose\":\"Physical Activity\",\"explanation\":\"PA3\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":60}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to maintain their behaviour in practicing PA ≥ 60 minutes for 7 days/week and  playing different sports\",\"actionId\":\"4721538f-f4dd-4b29-9349-d027690ac20c\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"gt\",\"label\":\"Greater than\",\"icon\":\"assets/images/operators/greaterthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":45}]},{\"parameter\":{\"name\":\"PA3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":60}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to practice PA ≥ 60 minutes for 7 days/week and playing different sports\",\"actionId\":\"0d049618-72ce-4686-a285-e89eaa2c4fd8\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA3\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":45}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to practice PA ≥ 60 minutes for ≥ 3 days/week and playing different sports\",\"actionId\":\"2bb8f3af-29c8-4f77-a9ac-f00ebd56916a\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":10}',1,'2019-07-23 08:15:48','2020-01-31 10:58:02'),(11,'Hydration. Adequate water consumption','Hydration. Adequate water consumption','education','Education','E4','','',50,NULL,_binary '{\"title\":\"Hydration. Adequate water consumption\",\"purpose\":\"Education\",\"explanation\":\"E4\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":6}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain water consumption to ≥ 6 glasses of water/day. Educational challenges related\",\"actionId\":\"c9fcb087-41ed-47bd-b3b7-5695a836a591\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":6}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase water consumption to ≥ 6 glasses of water/day. Educational challenges related\",\"actionId\":\"e0db131e-06d1-4d1e-9a2d-6c7d8be36f6d\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":11}',1,'2019-07-23 08:19:58','2019-07-23 14:00:01'),(12,'Practise some activity with the family','Practise some activity with the family','physicalactivity','PhysicalActivity','PA6','','',50,NULL,_binary '{\"title\":\"Practise some activity with the family\",\"purpose\":\"PhysicalActivity\",\"explanation\":\"PA6\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA6\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children and parents to continue practising some physical activity together for ≥ 1 time/week\",\"actionId\":\"5e27fecd-d7e1-4443-941c-f200999c2d93\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA6\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children and parents to practise some physical activity together for ≥ 1 time/week\",\"actionId\":\"013770dd-3257-4a56-80a2-21df6ebc6b95\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":12}',1,'2019-07-23 13:25:50','2020-01-31 13:06:28'),(13,'Collaborate in meal preparation','Collaborate in meal preparation','education','Education','E8','','',50,NULL,_binary '{\"title\":\"Collaborate in meal preparation\",\"purpose\":\"Education\",\"explanation\":\"E8\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E8\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to maintain their behaviour in participating in meal preparation for at least 3 times/week.\",\"actionId\":\"8a9796fe-b50c-4499-ac78-0faa90251cc6\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E8\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to participate in meal preparation at least 1 time/week.\",\"actionId\":\"72e3da0f-6004-46c8-a7c1-6ac8b3c996fc\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":13}',1,'2019-07-23 13:29:13','2019-07-23 14:00:59'),(14,'Sleep the recommended amount of hours per day','Sleep the recommended amount of hours per day','physicalactivity','Physical Activity','PA5','','',50,NULL,_binary '{\"title\":\"Sleep the recommended amount of hours per day\",\"purpose\":\"PhysicalActivity\",\"explanation\":\"PA5\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":9}]},{\"parameter\":{\"name\":\"PA5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":11}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to keep their duration in sleep in ≥ 9 hours AND < 11 hours and provide them with specific recomendations about environmental conditions of the room, shutdown of electronic devices\",\"actionId\":\"06f958df-24ac-4b50-bc0f-39d2f630fcb8\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]},{\"parameter\":{\"name\":\"PA5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":9}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to sleep for ≥ 9 hours AND < 11 hours and provide them with specific recomendations about environmental conditions of the room, shutdown of electronic devices\",\"actionId\":\"059d0dcb-1c85-4b19-8399-9e89db1b9fb5\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]},{\"conditions\":[{\"parameter\":{\"name\":\"PA5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":11}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to sleep for ≥ 7 hours AND < 11 hours and provide them with specific recomendations about environmental conditions of the room, shutdown of electronic devices\",\"actionId\":\"21024980-f473-4637-b508-a8370c1ee5ae\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-10-25 07:52:05','2019-10-25 07:52:05'),(15,'Decrease consumption of fast food','Decrease consumption of fast food','diet','Diet','D5','','',50,NULL,_binary '{\"title\":\"Decrease consumption of fast food\",\"purpose\":\"Diet\",\"explanation\":\"D5\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain the consumption of fast food in ≤ 2 times/week\",\"actionId\":\"ac23aa4a-b4f9-47c1-835c-f67d0cbe8845\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]},{\"parameter\":{\"name\":\"D5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce the consumption of fast food to ≤ 2 times/week\",\"actionId\":\"827ad877-5b68-404e-8a6d-33d35aeedd44\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce the consumption of fast food to ≤ 5 times/week\",\"actionId\":\"6513bf6f-b945-468f-a8d8-ca88e766a457\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":15}',1,'2019-12-19 10:15:09','2020-01-17 13:13:11'),(16,'Decrease consumption of sugary and energy drinks (sugary soft drinks with/without gas energy drinks)','Decrease consumption of sugary and energy drinks (sugary soft drinks with/without gas energy drinks)','diet','Diet','D7','','',50,NULL,_binary '{\"title\":\"Decrease consumption of sugary and energy drinks (sugary soft drinks with/without gas energy drinks)\",\"purpose\":\"Diet\",\"explanation\":\"D7\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D7\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain sugary drinks consumption to ≤ 1 time/week\",\"actionId\":\"7bebaae6-2493-4f83-8659-8d8e39299205\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D7\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]},{\"parameter\":{\"name\":\"D7\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce sugary drinks consumption to ≤ 1 times/week\",\"actionId\":\"649a3174-7807-45b5-a566-6cfe494e438f\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D7\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce sugary drinks consumption to ≤ 3 times/week\",\"actionId\":\"4161d5a0-9f05-4b01-84c2-35f43ecc0d64\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:18:38','2019-12-19 10:18:38'),(17,'Decrease consumption of sugary industrial juices (industrial packaged juices)','Decrease consumption of sugary industrial juices (industrial packaged juices)','diet','Diet','D12','','',50,NULL,_binary '{\"title\":\"Decrease consumption of sugary industrial juices (industrial packaged juices)\",\"purpose\":\"Diet\",\"explanation\":\"D12\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D12\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain industrial juices consumption to ≤ 1 time/week\",\"actionId\":\"2a909a93-1d61-466e-9319-82736e0b3250\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D12\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]},{\"parameter\":{\"name\":\"D12\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce industrial juices consumption to ≤ 1 times/week\",\"actionId\":\"f8f267ba-af8e-402a-908b-a9f3b75ec3b6\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D12\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce industrial juices consumption to ≤ 3 times/week\",\"actionId\":\"a7cfe424-bb3a-4454-ba29-7e015ae05676\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":17}',1,'2019-12-19 10:21:35','2020-01-17 14:43:45'),(18,'Decrease consumption of industrial pastry (including chocolate biscuits)','Decrease consumption of industrial pastry (including chocolate biscuits)','diet','Diet','D13','','',50,NULL,_binary '{\"title\":\"Decrease consumption of industrial pastry (including chocolate biscuits)\",\"purpose\":\"Diet\",\"explanation\":\"D13\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D13\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain the consumption of industrial pastry food to ≤ 2 times/week\",\"actionId\":\"6f35df5f-ff3a-4d1c-9caf-79ddfbfb5b3d\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D13\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]},{\"parameter\":{\"name\":\"D13\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce the consumption of industrial pastry to ≤ 2 times/week\",\"actionId\":\"22694656-1e09-465c-bb77-17ea842a296e\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D13\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce the consumption of industrial pastry to ≤ 5 times/week\",\"actionId\":\"f1adf602-5546-4d7b-8bb9-6efe6a98ac86\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":18}',1,'2019-12-19 10:24:38','2020-01-17 13:07:09'),(19,'Decrease consumption of ice creams and caloric/ sugary desserts.','Decrease consumption of ice creams and caloric/ sugary desserts.','diet','Diet','D14','','',50,NULL,_binary '{\"title\":\"Decrease consumption of ice creams and caloric/ sugary desserts.\",\"purpose\":\"Diet\",\"explanation\":\"D14\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D14\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain the consumption of caloric desserts to ≤ 2 times/week\",\"actionId\":\"de867b49-b83a-4674-959e-388d69672a48\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D14\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]},{\"parameter\":{\"name\":\"D14\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce the consumption of caloric desserts to ≤ 2 times/week\",\"actionId\":\"ea761206-df56-4be3-a8db-987a5ddc9ea5\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D14\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Reduce the consumption of caloric desserts to ≤ 5 times/week\",\"actionId\":\"16c232f9-1f1c-40e6-83d2-e2562e25e828\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}],\"ruleId\":19}',1,'2019-12-19 10:28:23','2020-01-17 13:09:02'),(20,'Increase dairy products consumption','Increase dairy products consumption','diet','Diet','D8','','',50,NULL,_binary '{\"title\":\"Increase dairy products consumption\",\"purpose\":\"Diet\",\"explanation\":\"D8\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D8\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Maintain dairy products consumption to ≥ 3 times/day\",\"actionId\":\"2df1fa91-eb4b-46dd-a6f6-b7e903174825\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D8\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]},{\"parameter\":{\"name\":\"D8\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase dairy products consumption to ≥ 3 times/day\",\"actionId\":\"c19ff98b-3255-4256-be7a-4536268586e0\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D8\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase dairy products consumption to ≥ 1 times/day\",\"actionId\":\"a5f9d16e-9f9f-4a9c-82b6-c7486eb85842\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:31:47','2019-12-19 10:31:47'),(21,'Increase fish consumption','Increase fish consumption','diet','Diet','D9','','',50,NULL,_binary '{\"title\":\"Increase fish consumption\",\"purpose\":\"Diet\",\"explanation\":\"D9\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D9\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain fish consumption in ≥ 2 times/week\",\"actionId\":\"ccd38921-8bf7-477a-b1eb-214b862c2242\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D9\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase fish consumption to ≥ 2 times/week\",\"actionId\":\"a0de167e-2c93-49c8-aba7-be9b1e042150\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D9\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase fish consumption to ≥ 1 time/week\",\"actionId\":\"a701d46d-b273-4a0b-b4dd-05d6fcafca88\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:34:10','2019-12-19 10:34:10'),(22,'Increase legume consumption','Increase legume consumption','diet','Diet','D10','','',50,NULL,_binary '{\"title\":\"Increase legume consumption\",\"purpose\":\"Diet\",\"explanation\":\"D10\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain legume consumption in ≥ 2 times/week\",\"actionId\":\"4151e11c-1f9e-4a55-9f93-58b1f9b22449\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase legume consumption to ≥ 2 times/week\",\"actionId\":\"bd6e2feb-885c-413d-a259-cb6240e456c6\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase legume consumption to ≥ 1 time/week\",\"actionId\":\"3d492eac-da56-40f7-b13c-f97ce41696fb\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:36:10','2019-12-19 10:36:10'),(23,'Increase nuts consumption','Increase nuts consumption','diet','Diet','D11','','',50,NULL,_binary '{\"title\":\"Increase nuts consumption\",\"purpose\":\"Diet\",\"explanation\":\"D11\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D11\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain nuts consumption in ≥ 2 times/week\",\"actionId\":\"646e9aca-5af5-4b68-96dd-39398eeb6a58\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D11\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase nuts consumption to ≥ 2 times/week\",\"actionId\":\"3f371170-d143-4541-9508-e6eb04b35d4c\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D11\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase nuts consumption to ≥ 1 time/week\",\"actionId\":\"7fde34ad-d405-4b9e-aef8-a2c7a3604b49\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:38:09','2019-12-19 10:38:09'),(24,'Consume variety of vegetables','Consume variety of vegetables','education','Education','E2','','',50,NULL,_binary '{\"title\":\"Consume variety of vegetables\",\"purpose\":\"Education\",\"explanation\":\"E2\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E2\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":4}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume variety of vegetables (≥4) to encourage different flavors and textures\",\"actionId\":\"8e465c6b-c8a7-4a0a-aac9-99518f52ebe6\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E2\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume variety of vegetables (≥4) to encourage different flavors and textures\",\"actionId\":\"53218746-11e3-4eac-bdee-47232dbdd8fd\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E2\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume variety of vegetables (>2) to encourage different flavors and textures\",\"actionId\":\"69a96cc2-1e85-488a-9862-8ff0294ccfbc\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:42:44','2019-12-19 10:42:44'),(25,'Collaborate in the purchase of the family food','Collaborate in the purchase of the family food','education','Education','E9','','',50,NULL,_binary '{\"title\":\"Collaborate in the purchase of the family food\",\"purpose\":\"Education\",\"explanation\":\"E9\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E9\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to maintain their behaviour in going to the supermarket with their parents ≥ 1 times/week\",\"actionId\":\"2f0b2a79-60c2-4093-82c2-3c48fb52e0fe\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E9\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":0}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to go to the supermarket with their parents ≥ 1 times/week\",\"actionId\":\"9129f2af-b194-4eec-9838-21af75be5915\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:44:12','2019-12-19 10:44:12'),(26,'Reach the number of recommended steps a day','Reach the number of recommended steps a day','physicalactivity','Physical Activity','PA4','','',50,NULL,_binary '{\"title\":\"Reach the number of recommended steps a day\",\"purpose\":\"Physical Activity\",\"explanation\":\"PA4\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":10000}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to maintain their behaviour in walking ≥ 10000 steps 7 days/week and play different activities\",\"actionId\":\"539c4947-c217-4a0f-838a-4a603aeffe57\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":10000}]},{\"parameter\":{\"name\":\"PA4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":6000}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to walk ≥ 10000 steps 7 days/week and play different activities\",\"actionId\":\"8c3d9532-e254-484b-8b12-1b4da933d253\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"PA4\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"PhysicalActivity\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"lt\",\"label\":\"Less than\",\"icon\":\"assets/images/operators/lesshan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":6000}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Encourage children to walk ≥ 6000 steps 7 days/week and play different activities\",\"actionId\":\"6ee2b940-a371-40e8-b41c-7daf91ec6df0\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2019-12-19 10:47:05','2019-12-19 10:47:05'),(28,'How frequently do you eat milk, yogurts, cheese or similar? (the sum of all togehther)','How frequently do you eat milk, yogurts, cheese or similar? (the sum of all togehther)','education','Education','E10','','',50,NULL,_binary '{\"title\":\"How frequently do you eat milk, yogurts, cheese or similar? (the sum of all togehther)\",\"purpose\":\"Education\",\"explanation\":\"E10\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"gt\",\"label\":\"Greater than\",\"icon\":\"assets/images/operators/greaterthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Mantain dairy products consumption to ≥ 3 times/day\",\"actionId\":\"2ad498d6-784b-4b1f-9a7f-80b08b4ca414\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]},{\"parameter\":{\"name\":\"E10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase dairy products consumption to ≥ 3 times/day\",\"actionId\":\"ca0dcff3-a70e-4b87-99eb-8a1a44e4d76a\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E10\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":0}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Increase dairy products consumption to ≥ 1 times/day\",\"actionId\":\"021d2ea8-1930-40ec-af87-2b7d40c1f26f\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2020-01-28 11:32:47','2020-01-28 11:32:47'),(29,'Did you usually watch the TV, tablet or mobile phone while you were eating?','Did you usually watch the TV, tablet or mobile phone while you were eating?','education','Education','E5','','',50,NULL,_binary '{\"title\":\"Did you usually watch the TV, tablet or mobile phone while you were eating?\",\"purpose\":\"Education\",\"explanation\":\"E5\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":0}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Well done! No screens at meals! Mantain your behaviour this week\",\"actionId\":\"9fc985bd-193f-4a31-842f-0c12680d8c84\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":1}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"You have to reduce the screen time during meals. This week 0 times!\",\"actionId\":\"9581fb63-cfcf-4b3a-bb7a-2c0283f96f99\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"E5\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Education\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"eq\",\"label\":\"Equals\",\"icon\":\"assets/images/operators/equalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"You have to reduce the screen time during meals. This week 3 times maximum!\",\"actionId\":\"24ea7fb9-f64b-454c-9d0d-47bfe303b52f\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2020-01-29 08:47:01','2020-01-29 08:47:01'),(30,'How frequently do you usually have caloric and sugary fried snacks?','How frequently do you usually have caloric and sugary fried snacks?','diet','Diet','D15','','',50,NULL,_binary '{\"title\":\"How frequently do you usually have caloric and sugary fried snacks?\",\"purpose\":\"Diet\",\"explanation\":\"D15\",\"keywords\":[],\"links\":[],\"sets\":[{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D15\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":2}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume fried snacks less than 2 times/week\",\"actionId\":\"189009fb-1595-4712-b18d-979b6387b34b\",\"severity\":\"0\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D15\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":3}]},{\"parameter\":{\"name\":\"D15\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"le\",\"label\":\"Less or equal than\",\"icon\":\"assets/images/operators/lessequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":6}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume fried snacks 2 or less than 2 times/week\",\"actionId\":\"2b241f11-73c8-4f61-8b23-f9220ccb78fb\",\"severity\":\"1\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}},{\"$or\":[{\"conditions\":[{\"parameter\":{\"name\":\"D15\",\"type\":\"double\",\"min\":0,\"max\":0,\"units\":\"\",\"tableName\":\"Diet\"},\"isFullyInitialized\":true,\"operators\":[{\"type\":{\"type\":\"ge\",\"label\":\"Greater or equal than\",\"icon\":\"assets/images/operators/greaterequalthan\"},\"compareWith\":0,\"measureType\":\"last\",\"value\":7}]}]}],\"actions\":[{\"type\":{\"type\":\"severity\",\"label\":\"Severity\"},\"doctors\":[],\"occurances\":1,\"message\":\"Consume fried snacks  5 or less times/week\",\"actionId\":\"614c55ce-4d1c-4512-a1a4-fd6d00929b64\",\"severity\":\"2\"}],\"logical\":{\"type\":\"and\",\"label\":\"And\"}}]}',1,'2020-01-31 12:45:41','2020-01-31 12:45:41');
/*!40000 ALTER TABLE `ardenrule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ardenruleforpatient`
--

DROP TABLE IF EXISTS `ardenruleforpatient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ardenruleforpatient` (
  `ardenRuleForPatientId` int(11) NOT NULL AUTO_INCREMENT,
  `patientRecordId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `ardenRuleId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`ardenRuleForPatientId`),
  KEY `userId` (`userId`),
  KEY `ardenRuleId` (`ardenRuleId`),
  CONSTRAINT `ardenruleforpatient_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `ardenruleforpatient_ibfk_2` FOREIGN KEY (`ardenRuleId`) REFERENCES `ardenrule` (`ardenRuleId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ardenruleforpatient`
--

LOCK TABLES `ardenruleforpatient` WRITE;
/*!40000 ALTER TABLE `ardenruleforpatient` DISABLE KEYS */;
/*!40000 ALTER TABLE `ardenruleforpatient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assigned_mission`
--

DROP TABLE IF EXISTS `assigned_mission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assigned_mission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `missionId` int(11) NOT NULL,
  `childId` varchar(255) DEFAULT NULL,
  `activeStatus` varchar(255) NOT NULL,
  `validationStatus` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `completedDate` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `missionId` (`missionId`),
  CONSTRAINT `missionId` FOREIGN KEY (`missionId`) REFERENCES `educator_mission` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assigned_mission`
--

LOCK TABLES `assigned_mission` WRITE;
/*!40000 ALTER TABLE `assigned_mission` DISABLE KEYS */;
/*!40000 ALTER TABLE `assigned_mission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `categoryId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_migrations`
--

DROP TABLE IF EXISTS `custom_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_migrations`
--

LOCK TABLES `custom_migrations` WRITE;
/*!40000 ALTER TABLE `custom_migrations` DISABLE KEYS */;
INSERT INTO `custom_migrations` VALUES (1,'1581334233044','2020-03-03 21:17:01','2020-03-03 21:17:01'),(2,'1581511158709','2020-03-03 21:17:01','2020-03-03 21:17:01'),(3,'1581665116228','2020-03-03 21:17:01','2020-03-03 21:17:01'),(4,'1581675088859','2020-03-03 21:17:01','2020-03-03 21:17:01'),(5,'1581677172319','2020-03-03 21:17:01','2020-03-03 21:17:01'),(6,'1581680129494','2020-03-03 21:17:01','2020-03-03 21:17:01'),(7,'1581926198773','2020-03-03 21:17:02','2020-03-03 21:17:02'),(8,'1582022609323','2020-03-03 21:17:02','2020-03-03 21:17:02'),(9,'1582030041473','2020-03-03 21:17:02','2020-03-03 21:17:02');
/*!40000 ALTER TABLE `custom_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `educator_mission`
--

DROP TABLE IF EXISTS `educator_mission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `educator_mission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creatorId` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `goal` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `durationType` varchar(255) DEFAULT NULL,
  `durationNumber` int(11) DEFAULT NULL,
  `childRecommendation` varchar(255) DEFAULT NULL,
  `parentRecommendation` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `educator_mission`
--

LOCK TABLES `educator_mission` WRITE;
/*!40000 ALTER TABLE `educator_mission` DISABLE KEYS */;
/*!40000 ALTER TABLE `educator_mission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food_recognition`
--

DROP TABLE IF EXISTS `food_recognition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `food_recognition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `outcome` varchar(255) DEFAULT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `captureDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `childId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_recognition`
--

LOCK TABLES `food_recognition` WRITE;
/*!40000 ALTER TABLE `food_recognition` DISABLE KEYS */;
/*!40000 ALTER TABLE `food_recognition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `notificationId` bigint(20) NOT NULL AUTO_INCREMENT,
  `notifyUserId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `notificationType` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8_unicode_ci,
  `viewed` tinyint(1) DEFAULT '0',
  `pushed` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`notificationId`),
  KEY `notifyUserId` (`notifyUserId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`notifyUserId`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observation`
--

DROP TABLE IF EXISTS `observation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `observation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `value` double DEFAULT NULL,
  `measurementType` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `measurement` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `observationDate` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ardenResult` int(11) DEFAULT NULL,
  `measureFhirId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `observation_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observation`
--

LOCK TABLES `observation` WRITE;
/*!40000 ALTER TABLE `observation` DISABLE KEYS */;
/*!40000 ALTER TABLE `observation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observations_new`
--

DROP TABLE IF EXISTS `observations_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `observations_new` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `value` double DEFAULT NULL,
  `measurementType` varchar(255) DEFAULT NULL,
  `measurement` varchar(255) DEFAULT NULL,
  `ardenResult` int(11) DEFAULT NULL,
  `observationDate` datetime DEFAULT NULL,
  `measureFhirId` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `childId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observations_new`
--

LOCK TABLES `observations_new` WRITE;
/*!40000 ALTER TABLE `observations_new` DISABLE KEYS */;
/*!40000 ALTER TABLE `observations_new` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patientaudit`
--

DROP TABLE IF EXISTS `patientaudit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patientaudit` (
  `patientAuditId` int(11) NOT NULL AUTO_INCREMENT,
  `changeKey` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `parameters` text COLLATE utf8_unicode_ci,
  `patientId` int(11) DEFAULT NULL,
  `doctorId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`patientAuditId`),
  KEY `patientId` (`patientId`),
  CONSTRAINT `patientaudit_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patientaudit`
--

LOCK TABLES `patientaudit` WRITE;
/*!40000 ALTER TABLE `patientaudit` DISABLE KEYS */;
/*!40000 ALTER TABLE `patientaudit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `robot_result`
--

DROP TABLE IF EXISTS `robot_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `robot_result` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `favorite_sport` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `date_sent` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `robot_result`
--

LOCK TABLES `robot_result` WRITE;
/*!40000 ALTER TABLE `robot_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `robot_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `robot_result_log`
--

DROP TABLE IF EXISTS `robot_result_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `robot_result_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `score` float DEFAULT NULL,
  `category` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `robot_result_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `robot_result_id` (`robot_result_id`),
  CONSTRAINT `robot_result_log_ibfk_1` FOREIGN KEY (`robot_result_id`) REFERENCES `robot_result` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `robot_result_log`
--

LOCK TABLES `robot_result_log` WRITE;
/*!40000 ALTER TABLE `robot_result_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `robot_result_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `robot_result_mission`
--

DROP TABLE IF EXISTS `robot_result_mission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `robot_result_mission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mission` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `robot_result_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `robot_result_id` (`robot_result_id`),
  CONSTRAINT `robot_result_mission_ibfk_1` FOREIGN KEY (`robot_result_id`) REFERENCES `robot_result` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `robot_result_mission`
--

LOCK TABLES `robot_result_mission` WRITE;
/*!40000 ALTER TABLE `robot_result_mission` DISABLE KEYS */;
/*!40000 ALTER TABLE `robot_result_mission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ruleresult`
--

DROP TABLE IF EXISTS `ruleresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ruleresult` (
  `ruleResultId` int(11) NOT NULL AUTO_INCREMENT,
  `counter` int(11) DEFAULT NULL,
  `actionId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `ruleId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`ruleResultId`),
  KEY `userId` (`userId`),
  KEY `ruleId` (`ruleId`),
  CONSTRAINT `ruleresult_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `app_user` (`userId`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `ruleresult_ibfk_2` FOREIGN KEY (`ruleId`) REFERENCES `ardenrule` (`ardenRuleId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ruleresult`
--

LOCK TABLES `ruleresult` WRITE;
/*!40000 ALTER TABLE `ruleresult` DISABLE KEYS */;
/*!40000 ALTER TABLE `ruleresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_roles`
--

DROP TABLE IF EXISTS `users_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_roles` (
  `userId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `users_roles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `app_user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_roles_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `app_role` (`roleId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_roles`
--

LOCK TABLES `users_roles` WRITE;
/*!40000 ALTER TABLE `users_roles` DISABLE KEYS */;
INSERT INTO `users_roles` VALUES (1,2);
/*!40000 ALTER TABLE `users_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_mission`
--

DROP TABLE IF EXISTS `weekly_mission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weekly_mission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `questionnaire` varchar(255) DEFAULT NULL,
  `goal` varchar(255) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `options` blob,
  `mission` blob,
  `progress` float DEFAULT NULL,
  `recommendations` blob,
  `activeStatus` varchar(255) DEFAULT NULL,
  `validationStatus` varchar(255) DEFAULT NULL,
  `creatorId` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `completedDate` datetime DEFAULT NULL,
  `weekNumber` int(11) DEFAULT NULL,
  `severity` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `childId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_mission`
--

LOCK TABLES `weekly_mission` WRITE;
/*!40000 ALTER TABLE `weekly_mission` DISABLE KEYS */;
/*!40000 ALTER TABLE `weekly_mission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_questionnaires`
--

DROP TABLE IF EXISTS `weekly_questionnaires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weekly_questionnaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `childId` varchar(255) DEFAULT NULL,
  `questionnairesIds` varchar(255) NOT NULL,
  `week` varchar(255) NOT NULL,
  `year` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_questionnaires`
--

LOCK TABLES `weekly_questionnaires` WRITE;
/*!40000 ALTER TABLE `weekly_questionnaires` DISABLE KEYS */;
/*!40000 ALTER TABLE `weekly_questionnaires` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-03-03 21:21:12
