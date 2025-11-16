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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 15:30:05
