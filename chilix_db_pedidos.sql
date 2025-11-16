-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: chilix_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `extras` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(50) DEFAULT 'pendiente' COMMENT 'pendiente, preparando, listo, entregado, cancelado',
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notas` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha_pedido`),
  KEY `idx_pedido_fecha_estado` (`fecha_pedido`,`estado`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,2,'CH000001',35.00,5.00,40.00,'entregado','2025-11-11 00:40:28','2025-11-11 00:40:28',NULL),(2,3,'CH000002',45.00,0.00,45.00,'listo','2025-11-11 00:40:28','2025-11-11 00:40:28',NULL),(3,2,'CH000003',120.00,10.00,130.00,'preparando','2025-11-11 00:40:28','2025-11-11 00:40:28',NULL),(6,1,'CH022414',70.00,10.00,80.00,'pendiente','2025-11-11 01:03:42','2025-11-11 01:03:42','Entrega en el recreo'),(10,6,'CH335604',120.00,0.00,120.00,'pendiente','2025-11-11 01:25:35','2025-11-11 01:25:35','Pedido desde la web'),(11,6,'CH362127',45.00,0.00,45.00,'pendiente','2025-11-11 01:26:02','2025-11-11 01:26:02','Pedido desde la web'),(12,6,'CH431538',45.00,0.00,45.00,'pendiente','2025-11-11 01:27:11','2025-11-11 01:27:11','Pedido desde la web'),(13,6,'CH439281',45.00,0.00,45.00,'pendiente','2025-11-11 01:27:19','2025-11-11 01:27:19','Pedido desde la web'),(14,6,'CH521175',45.00,0.00,45.00,'pendiente','2025-11-11 01:28:41','2025-11-11 01:28:41','Pedido desde la web'),(15,6,'CH209570',35.00,0.00,35.00,'pendiente','2025-11-11 01:40:09','2025-11-11 01:40:09','Pedido desde la web'),(16,6,'CH361014',80.00,10.00,90.00,'pendiente','2025-11-16 20:02:41','2025-11-16 20:02:41','Pedido desde la web'),(17,6,'CH799494',35.00,0.00,35.00,'pendiente','2025-11-16 20:43:19','2025-11-16 20:43:19','Pedido desde la web'),(18,6,'CH113671',245.00,0.00,245.00,'pendiente','2025-11-16 20:48:33','2025-11-16 20:48:33','Pedido desde la web'),(19,6,'CH693254',245.00,0.00,245.00,'pendiente','2025-11-16 20:58:13','2025-11-16 20:58:13','Pedido desde la web');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER actualizar_fecha_pedido
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 15:30:05
