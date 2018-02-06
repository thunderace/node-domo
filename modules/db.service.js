var mysql = require('mysql');

module.exports = {
  getDBConnection: function (dbName) {
    var connection = mysql.createConnection({
      host     : "localhost",
      user     : dbName,
      password : dbName,
      database : dbName
    });
    return connection;
  },
  getBOFromDB: function (dbName, boName, fields, req, res, condition) {
    var t1 = Date.now();
    console.log("Execution getBOFromDB ["+boName+"]");
    var connection = this.getDBConnection(dbName);
    connection.connect();
    var query = "SELECT "+fields+" FROM "+boName;
    if (condition != undefined && condition != "") {
      query+=" "+condition;
    }
    connection.query(query, function(err, rows, fields) {
      if (!err) {
        var t2 = Date.now();
        var dt1 = t2-t1;
        res.json(rows);
        var t3 = Date.now();
        var dt2 = t3-t2;
        var dt3 = t3-t1;
        console.log("Execution requete ["+query+"] ok (total = "+dt3+" ms, requête en "+dt1+" ms)");
      }
      else {
        console.log("Erreur execution requete ["+query+"]");
        res.send(); 
      }
    });
    connection.end();     
  }
};
