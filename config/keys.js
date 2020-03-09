const { db_port, db_host, db_name, db_ip, db_username, db_password }= require('./config');

module.exports = {
	MongoURI: `${db_host}://${db_ip}:${db_port}/${db_name}`
}