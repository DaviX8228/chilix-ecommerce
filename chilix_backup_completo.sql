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
-- Table structure for table `detalle_pedidos`
--

DROP TABLE IF EXISTS `detalle_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `personalizaciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'chamoy, miguelito, limon, sinSal, comments' CHECK (json_valid(`personalizaciones`)),
  PRIMARY KEY (`id`),
  KEY `idx_pedido` (`pedido_id`),
  KEY `idx_producto` (`producto_id`),
  CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
INSERT INTO `detalle_pedidos` VALUES (1,1,1,1,35.00,35.00,'{\"chamoy\": true, \"miguelito\": false, \"limon\": true, \"comments\": \"Extra picante\"}'),(2,2,2,1,45.00,45.00,'{\"chamoy\": false, \"miguelito\": false, \"limon\": false, \"comments\": \"\"}'),(3,3,3,1,120.00,120.00,'{\"chamoy\": true, \"miguelito\": true, \"limon\": false, \"comments\": \"Regalo para cumpleaños\"}'),(4,6,1,2,35.00,70.00,'{\"chamoy\":true,\"miguelito\":false,\"limon\":true,\"comments\":\"Extra picante\"}'),(7,10,3,1,120.00,120.00,'{}'),(8,11,2,1,45.00,45.00,'{}'),(9,12,2,1,45.00,45.00,'{}'),(10,13,2,1,45.00,45.00,'{}'),(11,14,2,1,45.00,45.00,'{}'),(12,15,1,1,35.00,35.00,'{}'),(13,16,2,1,45.00,45.00,'{\"sinSal\":true}'),(14,16,1,1,35.00,35.00,'{\"chamoy\":true,\"miguelito\":true}'),(15,17,1,1,35.00,35.00,'{}'),(16,18,1,1,35.00,35.00,'{}'),(17,18,2,2,45.00,90.00,'{}'),(18,18,3,1,120.00,120.00,'{}'),(19,19,1,1,35.00,35.00,'{}'),(20,19,2,2,45.00,90.00,'{}'),(21,19,3,1,120.00,120.00,'{}');
/*!40000 ALTER TABLE `detalle_pedidos` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER validar_stock_antes_pedido
BEFORE INSERT ON detalle_pedidos
FOR EACH ROW
BEGIN
    DECLARE v_stock_actual INT;
    
    SELECT stock INTO v_stock_actual
    FROM productos
    WHERE id = NEW.producto_id;
    
    IF v_stock_actual < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para este producto';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `imagen_url` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `nivel_picante` int(11) DEFAULT 3 COMMENT '1=Bajo, 5=Alto',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_producto_stock` (`stock`,`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'ChiliX Snacks','Botanas crujientes con el toque perfecto de chile y limón. Ideal para el recreo o entre clases.',35.00,93,NULL,'clasico',3,1,'2025-11-11 00:40:28'),(2,'ChiliX Mix','Una mezcla explosiva de diferentes snacks enchilados. Variedad de sabores y texturas en cada bocado.',45.00,41,NULL,'mix',4,1,'2025-11-11 00:40:28'),(3,'ChiliX Box','La caja premium. Incluye todos nuestros productos más snacks exclusivos y sorpresas.',120.00,17,NULL,'premium',3,1,'2025-11-11 00:40:28');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
INSERT INTO `sesiones` VALUES (1,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ0dUBlbWFpbC5jb20iLCJpYXQiOjE3NjI4MjI2MTgsImV4cCI6MTc2MjkwOTAxOH0._zLPoh-RqZgQw7gbtwC1TOARiNaGlWrPhJ-1WXMok1g','2025-11-11 00:56:58','2025-11-12 00:56:58',1),(2,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ0dUBlbWFpbC5jb20iLCJpYXQiOjE3NjI4MjI5OTYsImV4cCI6MTc2MjkwOTM5Nn0.t3aKd1qj677yQL2c7W1vyuqkPgphljj5w9M_xJzkxAs','2025-11-11 01:03:16','2025-11-12 01:03:16',1),(3,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwZXBlQGdtYWlsLmNvbSIsImlhdCI6MTc2MjgyMzY3MCwiZXhwIjoxNzYyOTEwMDcwfQ.KMkBAogZ-4zku25VCa76JUmz0xfT0dW4o10_w9_zdE4','2025-11-11 01:14:30','2025-11-12 01:14:30',1),(4,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwZXBlQGdtYWlsLmNvbSIsImlhdCI6MTc2MjgyMzg5MywiZXhwIjoxNzYyOTEwMjkzfQ.kIp-_ANrzO3hWM5hLbL-eeyAoQBArQoeDHMkuYHaD7k','2025-11-11 01:18:13','2025-11-12 01:18:13',1),(5,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwZXBlQGdtYWlsLmNvbSIsImlhdCI6MTc2MzMyMzM0OSwiZXhwIjoxNzYzNDA5NzQ5fQ.kEYNohv12pmH1YpA4I5AAOZtmcdq07io_PJZmwCRnxk','2025-11-16 20:02:29','2025-11-17 20:02:29',1),(6,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwZXBlQGdtYWlsLmNvbSIsImlhdCI6MTc2MzMyNDkyMiwiZXhwIjoxNzYzNDExMzIyfQ.DnP8E2WVfKHgSGeStYJ7s2UFKnw_Lhp8DSdme8PzPdk','2025-11-16 20:28:42','2025-11-17 20:28:42',1),(7,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJwZXBlQGdtYWlsLmNvbSIsImlhdCI6MTc2MzMyNDk2NiwiZXhwIjoxNzYzNDExMzY2fQ.OgrjV0kG0EilJQU3XGbf57ElpLoAU43JQpy82O0qs6Y','2025-11-16 20:29:26','2025-11-17 20:29:26',1);
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Usuario de Prueba','test@chilix.mx','5512345678','$2b$10$rQZ1vZ9Z9Z9Z9Z9Z9Z9Z9.Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z','2025-11-11 00:40:28',1),(2,'David Velazquez','david@chilix.mx','5511111111','$2b$10$testpassword','2025-11-11 00:40:28',1),(3,'María García','maria@cecyt8.edu.mx','5522222222','$2b$10$testpassword','2025-11-11 00:40:28',1),(4,'Juan Pérez','juan@cecyt8.edu.mx','5533333333','$2b$10$testpassword','2025-11-11 00:40:28',1),(5,'Tu Nombre','tu@email.com','5512345678','$2b$10$gXUKidCDpNxy.7sbOx/Y.e4kawesNLhmkyxWe3XX8nxjiw.kgBAkq','2025-11-11 00:56:58',1),(6,'pepe','pepe@gmail.com','5551532699','$2b$10$E21CrQXzAvmX3kyrS3xqeO52cTuPaJTi8rwYpynwShFU5Vfoeruem','2025-11-11 01:14:30',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_pedidos_completos`
--

DROP TABLE IF EXISTS `vista_pedidos_completos`;
/*!50001 DROP VIEW IF EXISTS `vista_pedidos_completos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_pedidos_completos` AS SELECT 
 1 AS `pedido_id`,
 1 AS `numero_orden`,
 1 AS `total`,
 1 AS `estado`,
 1 AS `fecha_pedido`,
 1 AS `cliente_nombre`,
 1 AS `cliente_email`,
 1 AS `cliente_telefono`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_productos_populares`
--

DROP TABLE IF EXISTS `vista_productos_populares`;
/*!50001 DROP VIEW IF EXISTS `vista_productos_populares`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_productos_populares` AS SELECT 
 1 AS `id`,
 1 AS `nombre`,
 1 AS `precio`,
 1 AS `veces_vendido`,
 1 AS `unidades_vendidas`,
 1 AS `ingresos_totales`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'chilix_db'
--

--
-- Dumping routines for database 'chilix_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `crear_pedido` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `crear_pedido`(
    IN p_usuario_id INT,
    IN p_subtotal DECIMAL(10,2),
    IN p_extras DECIMAL(10,2),
    IN p_total DECIMAL(10,2),
    IN p_items JSON
)
BEGIN
    DECLARE v_pedido_id INT;
    DECLARE v_numero_orden VARCHAR(20);
    DECLARE v_item JSON;
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_items_count INT;
    
    -- Generar número de orden único
    SET v_numero_orden = CONCAT('CH', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    
    -- Insertar pedido
    INSERT INTO pedidos (usuario_id, numero_orden, subtotal, extras, total)
    VALUES (p_usuario_id, v_numero_orden, p_subtotal, p_extras, p_total);
    
    SET v_pedido_id = LAST_INSERT_ID();
    
    -- Obtener cantidad de items
    SET v_items_count = JSON_LENGTH(p_items);
    
    -- Insertar cada item
    WHILE v_index < v_items_count DO
        SET v_item = JSON_EXTRACT(p_items, CONCAT('$[', v_index, ']'));
        
        INSERT INTO detalle_pedidos (
            pedido_id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal,
            personalizaciones
        ) VALUES (
            v_pedido_id,
            JSON_UNQUOTE(JSON_EXTRACT(v_item, '$.producto_id')),
            JSON_UNQUOTE(JSON_EXTRACT(v_item, '$.cantidad')),
            JSON_UNQUOTE(JSON_EXTRACT(v_item, '$.precio_unitario')),
            JSON_UNQUOTE(JSON_EXTRACT(v_item, '$.subtotal')),
            JSON_EXTRACT(v_item, '$.personalizaciones')
        );
        
        -- Actualizar stock
        UPDATE productos 
        SET stock = stock - JSON_UNQUOTE(JSON_EXTRACT(v_item, '$.cantidad'))
        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(v_item, '$.producto_id'));
        
        SET v_index = v_index + 1;
    END WHILE;
    
    -- Retornar ID del pedido creado
    SELECT v_pedido_id as pedido_id, v_numero_orden as numero_orden;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vista_pedidos_completos`
--

/*!50001 DROP VIEW IF EXISTS `vista_pedidos_completos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_pedidos_completos` AS select `p`.`id` AS `pedido_id`,`p`.`numero_orden` AS `numero_orden`,`p`.`total` AS `total`,`p`.`estado` AS `estado`,`p`.`fecha_pedido` AS `fecha_pedido`,`u`.`nombre` AS `cliente_nombre`,`u`.`email` AS `cliente_email`,`u`.`telefono` AS `cliente_telefono` from (`pedidos` `p` join `usuarios` `u` on(`p`.`usuario_id` = `u`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_productos_populares`
--

/*!50001 DROP VIEW IF EXISTS `vista_productos_populares`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_productos_populares` AS select `pr`.`id` AS `id`,`pr`.`nombre` AS `nombre`,`pr`.`precio` AS `precio`,count(`dp`.`id`) AS `veces_vendido`,sum(`dp`.`cantidad`) AS `unidades_vendidas`,sum(`dp`.`subtotal`) AS `ingresos_totales` from (`productos` `pr` left join `detalle_pedidos` `dp` on(`pr`.`id` = `dp`.`producto_id`)) group by `pr`.`id`,`pr`.`nombre`,`pr`.`precio` order by sum(`dp`.`cantidad`) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 15:40:44
