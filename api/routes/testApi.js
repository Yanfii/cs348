var express = require('express');
var fs = require('fs');
var router = express.Router();
const mysql = require('mysql')

var shouldPopulateWithInitialData = false;
var initialData = fs.readFileSync('perfect_party.sql').toString();

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
 	password: 'bojana',
	database: 'cs348',
	multipleStatements: true,
  insecureAuth: true,
})

connection.connect(function(err) {
	(err)? console.log(err): console.log(connection);
	if (shouldPopulateWithInitialData) {
		connection.query(initialData, function(err, result) {
	        (err)? console.log('error loading initial data: ', err): console.log(result);
	  });
	}
})

router.post('/test', function(req, res, next) {
	var queryPlaceholders = [];
	queryPlaceholders.push(req.body.first_name)
	queryPlaceholders.push(req.body.last_name)
	queryPlaceholders.push(req.body.phone_number)
	connection.query(`INSERT INTO client (first_name, last_name, phone_number) VALUES (?, ?, ?)`, queryPlaceholders, function(err, data) {
        (err)?res.send(err): res.json({clients: data})
    })
});

router.get('/clients', function(req, res, next) {
		var queryStr = 'SELECT * FROM client WHERE TRUE ';
		var queryPlaceholders = [];
		if (req.query.id) {
			queryStr += 'AND id = ?, ';
			queryPlaceholders.push(req.query.id);
		}
		if (req.query.first_name) {
			queryStr += ' AND first_name = ?, ';
			queryPlaceholders.push(req.query.first_name);
		}
		if (req.query.last_name) {
			queryStr += 'AND last_name = ?, ';
			queryPlaceholders.push(req.query.last_name);
		}
		if (req.query.phone_number) {
			queryStr += 'AND phone_number = ?';
			queryPlaceholders.push(req.query.phone_number);
		}
    connection.query(queryStr, queryPlaceholders, function(err, data) {
        (err)?res.send(err):res.json({clients: data})
    })
});

// Updates a row of client info
router.put('/clients/:user_id', function(req, res, next) {
	var queryStr = 'UPDATE client SET ';
	var queryPlaceholders = [];
	if (req.body.first_name) {
		queryStr += 'first_name = ?, ';
		queryPlaceholders.push(req.body.first_name);
	}
	if (req.body.last_name) {
		queryStr += 'last_name = ?, ';
		queryPlaceholders.push(req.body.last_name);
	}
	if (req.body.phone_number) {
		queryStr += 'phone_number = ? ';
		queryPlaceholders.push(req.body.phone_number);
	}
	queryStr += 'WHERE user_id = ?';
	queryPlaceholders.push(req.body.user_id);
	var query = connection.query(queryStr, queryPlaceholders, function(err, data) {
		(err)?res.send(err):res.json({clients: data})
	})
	console.log(query.sql)
});

// Delete a user
router.delete('/clients/:user_id', function(req, res, next) {
	const queryStr = 'DELETE FROM client WHERE user_id= ?';
	connection.query(queryStr, [req.params.user_id], function(err, data) {
		(err)?res.send(err):res.json({clients: data})
	})
});

// Get events and cost per each event for a given user
router.get('/clients/:user_id', function(req, res, next) {
	const queryStr = 'SELECT event_id,`date`,LOCATION,title,SUM(cost_per_unit*units)FROM`Event` NATURAL JOIN Vendor_Item NATURAL JOIN`Transaction` WHERE user_id= ? GROUP BY event_id,date,LOCATION,title';
    connection.query(queryStr, [req.params.user_id], function(err, data) {
        (err)?res.send(err):res.json({clients: data})
    })
});

module.exports = router;
