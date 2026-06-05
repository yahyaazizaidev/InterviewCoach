-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: interviewcoach
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `responses`
--

DROP TABLE IF EXISTS `responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responses` (
  `response_id` int NOT NULL AUTO_INCREMENT,
  `interview_id` int NOT NULL,
  `question_id` int NOT NULL,
  `video_url` varchar(1000) DEFAULT NULL,
  `feedback` json DEFAULT NULL,
  `confidence` decimal(10,0) DEFAULT NULL,
  `transcript` longtext,
  `knowledge` float DEFAULT NULL,
  `gaze_straight_ratio` float DEFAULT '0',
  `blink_rate_per_min` float DEFAULT '0',
  `head_movement_avg` float DEFAULT '0',
  `posture_score` float DEFAULT '0',
  `gesture_frequency` float DEFAULT '0',
  `smile_intensity` float DEFAULT '0',
  `wpm` float DEFAULT '0',
  `filler_word_count` float DEFAULT '0',
  `pitch_mean` float DEFAULT '0',
  `energy_mean` float DEFAULT '0',
  `pause_frequency` float DEFAULT '0',
  `dominant_emotion` varchar(50) DEFAULT NULL,
  `audio_emotion` varchar(50) DEFAULT NULL,
  `attempt_number` int DEFAULT '0',
  PRIMARY KEY (`response_id`),
  KEY `responses_ibfk_1` (`interview_id`),
  KEY `responses_ibfk_2` (`question_id`),
  CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`interview_id`) ON DELETE CASCADE,
  CONSTRAINT `responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responses`
--

LOCK TABLES `responses` WRITE;
/*!40000 ALTER TABLE `responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `responses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 13:56:33
