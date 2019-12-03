  
<?php
try {
	$conn = new PDO("mysql:host=localhost", "root", "admins");
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	// sql to create database
	$sql = "CREATE DATABASE IF NOT EXISTS matcha;";
	$conn->exec($sql);
	$conn = null;

	// create users table
	include 'database.php';
	$sql = "CREATE TABLE IF NOT EXISTS `users` (
		`user_id` INT(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
		`username` TINYTEXT NOT NULL,
		`first_name` TINYTEXT,
		`last_name` TINYTEXT,
		`gender` TINYTEXT,
		`bio` TEXT,
		`profile_pic` TINYTEXT,
		`email` TINYTEXT NOT NULL,
		`password` TINYTEXT NOT NULL,
		`verified` BIT DEFAULT 0 NOT NULL,
		`verification_code` varchar(264) NOT NULL
		);";
	$conn->exec($sql);
	$conn = null;
} catch (PDOException $e) {
	die("Connection failed: " . $e->getMessage());
}
$conn = null;