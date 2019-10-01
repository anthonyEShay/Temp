const cool = require('cool-ascii-faces')
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var mongodb = require('mongodb');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => res.send(showTimes()))
  .get('/db', async (req, res) => {
	  try {
		  const client = await pool.connect()
		  const result = await client.query('SELECT * FROM test_table');
		  const results = { 'results': (result) ? result.rows : null};
		  res.render('pages/db', results );
		  client.release();
	  }catch (err) {
		  console.error(err);
		  res.send("Error " + err);
	  }
  })
  .get('/mongodb', function (request, response) {
    mongodb.MongoClient.connect('mongodb://heroku_xrhllv16:sikp9hb7dofqk0ja4l51et4eq3@ds229088.mlab.com:29088/heroku_xrhllv16', function(err, client) {
    // mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {  // works with mongodb v2 but not v3
        if(err) throw err;
        //get collection of routes
        var db = client.db('heroku_xrhllv16');  // in v3 we need to get the db from the client
        var Routes = db.collection('Routes');
        //get all Routes with frequency >=1
        Routes.find({ frequency : { $gte: 1 } }).sort({ name: 1 }).toArray(function (err, docs) {
            if(err) throw err;
            response.render('pages/mongodb', {results: docs});
        });
        //close connection when your app is terminating.
        // db.close(function (err) {
         client.close(function (err) {
            if(err) throw err;
        });
    });//end of connect
})//end app.get
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
//var express = require('express');

//var router = express.Router();

/* GET home page. */



showTimes = () => {
	let result = ''
	const times = process.env.TIMES || 5
	for (i = 0; i < times; i++){
		result += i + ' '
	}
	return result;
}