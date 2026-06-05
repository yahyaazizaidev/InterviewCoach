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
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `field_id` int NOT NULL,
  `question_text` text NOT NULL,
  `level` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `questions_ibfk_1` (`field_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`field_id`) REFERENCES `fields` (`field_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,3,'What is a data structure? Explain it','easy'),(2,3,'What is a linked list?','easy'),(3,3,'What is a stack?','easy'),(4,3,'What is a queue?','easy'),(5,3,'What is a tree?','easy'),(6,3,'Explain binary search.','medium'),(7,3,'What is a hash table?','medium'),(8,3,'Explain BFS.','medium'),(9,3,'Explain DFS.','medium'),(10,3,'What is dynamic programming?','medium'),(11,3,'What is a heap?','medium'),(12,3,'What is two-pointer technique?','medium'),(13,3,'Explain Dijkstra algorithm.','hard'),(14,3,'What is segment tree?','hard'),(15,3,'Explain backtracking.','hard'),(16,3,'What is AVL tree?','hard'),(17,3,'Explain KMP algorithm.','hard'),(18,3,'Explain graph cycle detection.','hard'),(19,3,'Explain topological sorting.','hard'),(20,3,'What is red-black tree?','hard'),(21,3,'Explain Floyd-Warshall algorithm.','hard'),(22,2,'What is OOP?','easy'),(23,2,'What is a class?','easy'),(24,2,'What is an object?','easy'),(25,2,'What is encapsulation?','easy'),(26,2,'What is inheritance?','easy'),(27,2,'Explain abstraction.','medium'),(28,2,'What is polymorphism?','medium'),(29,2,'What is a constructor?','medium'),(30,2,'What is method overloading?','medium'),(31,2,'Explain method overriding.','medium'),(32,2,'What is an interface?','medium'),(33,1,'What is a variable?','easy'),(34,1,'What is a data type?','easy'),(35,1,'What is a loop?','easy'),(36,1,'What is a function?','easy'),(37,1,'What is an array?','easy'),(38,1,'Explain pass by value vs pass by reference.','medium'),(39,1,'What is recursion?','medium'),(40,1,'What is debugging?','medium'),(41,1,'Explain time complexity.','medium'),(42,1,'What is a pointer?','medium'),(43,1,'What is type casting?','medium'),(44,1,'What is the difference between compile-time and runtime errors?','medium'),(45,1,'Explain memory management.','hard'),(46,1,'What is a segmentation fault?','hard'),(47,1,'Compiler vs Interpreter.','hard'),(48,1,'Explain pass by pointer.','hard'),(49,1,'Function call stack working.','hard'),(50,1,'What is tail recursion?','hard'),(51,1,'Explain static vs dynamic memory allocation.','hard'),(52,1,'Explain memory leaks.','hard'),(53,1,'Explain multi-threading basics.','hard'),(54,3,'Explain SOLID principles with real-world use.','hard'),(55,3,'What is multiple inheritance ambiguity and how is it resolved?','hard'),(56,3,'Explain polymorphic dispatch tables (vtable).','hard'),(57,3,'What is the difference between composition and aggregation?','hard'),(58,3,'Explain the Liskov Substitution Principle with example.','hard'),(59,3,'What is method overloading resolution?','hard'),(60,3,'Explain covariance and contravariance.','hard'),(61,3,'Explain how garbage collectors detect unreachable objects.','hard'),(62,3,'What is a metaclass?','hard'),(63,3,'Explain design patterns with emphasis on Factory and Observer.','hard'),(75,2,'What is the difference between early binding and late binding?','hard'),(76,2,'Explain the concept of Object Slicing in C++.','hard'),(77,2,'What is the Virtual Constructor Idiom? When is it needed?','hard'),(78,2,'Explain the RAII idiom with examples.','hard'),(79,2,'What is the difference between mixins and multiple inheritance?','hard'),(80,2,'Explain the Non-Virtual Interface (NVI) pattern.','hard'),(81,2,'What is the Curiously Recurring Template Pattern (CRTP)?','hard'),(82,2,'Explain the concept of type erasure in Java/C++ with examples.','hard'),(83,2,'What is the Expression Problem and how do different languages approach it?','hard'),(84,2,'Explain the difference between implementation inheritance and interface inheritance.','hard');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 13:56:32
