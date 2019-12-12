// Creating database
exports.create = function(req,res) {
	nanp.db.create(req.body.dbname, function(err) {
		if(err) {
			res.send("Error in creating Database");
			return;
		}
		res.send("Database created successfully");
	});
};