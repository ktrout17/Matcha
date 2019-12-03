<?php
$DB_DSN =  "camagru";
$DB_USER = "root";
$DB_PASSWORD = "admins";
try {
	$conn = new PDO("mysql:host=localhost;dbname=". $DB_DSN .";", $DB_USER , $DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$conn->setAttribute(PDO::ATTR_CASE, PDO::CASE_LOWER);
} catch (PDOException $e) {
	die("Connection failed: " . $e->getMessage());
}