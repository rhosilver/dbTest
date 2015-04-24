var onLoad = function(){
	var db;
	// Get Random Name {Used in Database to get Random table name for each test}
	function getRandomName(){
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
	};
	var beforeEach = function(){
		// beforeEach
		db = undefined;	
	};

	var afterEach = function(){
		// afterEach
		db.close()
		db = undefined;
	};

	var expect = function(testId, actual, expected){
		console.log("********************************");
		console.log("TEST CASE : " + testId);
		if(typeof(actual)!='object'){
			console.log("Actual : " + actual);
		} else {
			console.log("Actual : " + JSON.stringify(actual));
			actual = JSON.stringify(actual);
		}
		if(typeof(expected)!='object'){
			console.log("Expected : " + expected);
		} else {
			console.log("Expected : " + JSON.stringify(expected));
			expected = JSON.stringify(expected);
		}
		console.log("********************************");
		if(actual === expected){
			document.getElementById(testId).innerHTML = "<b style='color:green'>PASSED</b>";
		} else{
			document.getElementById(testId).innerHTML = "<b style='color:red'>FAILED</b>";
		}
	};

	var makeTableNames = function(nTables) {
	    var tableNames = [];
	    for (var i = 0; i < nTables; ++i) {
	        tableNames.push(getRandomName());
	    }
	    return tableNames;
	};

	var createTables = function(tableNames) {
	    var statements = [];
	    for (var i = 0; i < tableNames.length; ++i) {
	        statements.push('CREATE TABLE "' + tableNames[i] + '" (x INTEGER, y TEXT)');
	    }
	    db.executeBatchSql(statements.join(';'));
	};

	var allExist = function(tableNames) {
	    for (var i = 0; i < tableNames.length; ++i) {
	        if (!db.isTableExist(tableNames[i])) {
	            return false;
	        }
	    }
	    return true;
	};

	var anyExists = function(tableNames) {
	    for (var i = 0; i < tableNames.length; ++i) {
	        if (db.isTableExist(tableNames[i])) {
	            return true;
	        }
	    }
	    return false;
	};

	//VT287-01
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	expect('VT287-01', typeof(db), 'object');
	afterEach();

	//VT287-02
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeSql('CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT)');
	expect('VT287-02', db.isTableExist(tableName), true);
	afterEach();

	//VT287-03
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableNames = makeTableNames(4);
	createTables(tableNames);
	expect('VT287-03', allExist(tableNames), true);
	afterEach();

	//VT287-04
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableNames = makeTableNames(4);
	createTables(tableNames);
	db.destroyTables({'include': tableNames, 'exclude': []});
	expect('VT287-04', anyExists(tableNames), false);
	afterEach();

	//VT287-05
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableNames = makeTableNames(4);
	createTables(tableNames);
	db.destroyTables({'include': [], 'exclude': tableNames.slice(2)});
	expect('VT287-05a', allExist(tableNames.slice(2)), true);
	expect('VT287-05b', anyExists(tableNames.slice(0, 2)), false);
	afterEach();

	//VT287-06
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableNames = makeTableNames(4);
	createTables(tableNames);
	db.destroyTables({'include': tableNames.slice(0, 2), 'exclude': tableNames.slice(2)});
	expect('VT287-06a', allExist(tableNames.slice(2)), true);
	expect('VT287-06b', anyExists(tableNames.slice(0, 2)), false);
	afterEach();

	//VT287-07
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeSql('CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT)');
	db.destroyTable(tableName);
	expect('VT287-07', db.isTableExist(tableName), false);
	afterEach();

	/*//VT287-08
	beforeEach();
	afterEach();
	//VT287-09
	beforeEach();
	afterEach();*/

	//VT287-10
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeSql('CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT)');
	db.executeSql('INSERT INTO "' + tableName + '" (x, y) VALUES(?, ?)', [10, 'ten']);
	db.close();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	expect('VT287-10', db.executeSql('SELECT x FROM "' + tableName + '" WHERE y = "ten"'), [{x: '10'}]);
	afterEach();

	//VT287-11
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.startTransaction();
	db.executeBatchSql('DROP TABLE IF EXISTS "' + tableName + '"; CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT);') ;
	db.executeSql('INSERT INTO "' + tableName + '" (x, y) VALUES (?, ?)', [10, 'ten']);
	db.commitTransaction();
	expect('VT287-11', db.executeSql('SELECT x FROM "' + tableName + '" WHERE y = "ten"'), [{x: '10'}]);
	afterEach();

	//VT287-12
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeBatchSql('DROP TABLE IF EXISTS "' + tableName + '"; CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT);') ;
	db.startTransaction();
	db.executeSql('INSERT INTO "' + tableName + '" (x, y) VALUES (?, ?)', [10, 'fifteen']);
	expect('VT287-12a', db.executeSql('SELECT * FROM "' + tableName + '"'), [{x: '10', y: 'fifteen'}]);
	db.rollbackTransaction();
	expect('VT287-12b', db.executeSql('SELECT * FROM "' + tableName + '"'), []);
	afterEach();

	//VT287-13
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeBatchSql('DROP TABLE IF EXISTS "' + tableName + '"; CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT);');
	db.startTransaction();
	db.executeSql('INSERT INTO "' + tableName + '" (x, y) VALUES (?, ?)', [10, 'fifteen']);
	db.commitTransaction();
	db.rollbackTransaction();
	expect('VT287-13', db.executeSql('SELECT * FROM "' + tableName + '"'), [{x: '10', y: 'fifteen'}]);
	afterEach();

	/*//VT287-14
	beforeEach();
	afterEach();

	//VT287-15
	beforeEach();
	afterEach();
	*/
	//VT287-16
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	db.executeBatchSql('');
	afterEach();

	/*//VT287-17
	beforeEach();
	afterEach();

	//VT287-18
	beforeEach();
	afterEach();

	//VT287-19
	beforeEach();
	afterEach();

	//VT287-20
	beforeEach();
	afterEach();*/

	//VT287-21
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('app'), 'app');
	var tableName = getRandomName();
	db.executeSql('CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT)');
	expect('VT287-21', db.isTableExist(tableName), true);
	afterEach();

	//VT287-22
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('user'), 'user');
	var tableName = getRandomName();
	db.executeSql('CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT)');
	expect('VT287-22', db.isTableExist(tableName), true);
	afterEach();

	/*//VT287-23
	beforeEach();
	afterEach();*/

	//VT287-24
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeBatchSql('DROP TABLE IF EXISTS "' + tableName + '"; CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT);');
	db.startTransaction()
	db.executeSql('DROP TABLE "' + tableName + '"');
	expect('VT287-23a', db.isTableExist(tableName), false);
	db.rollbackTransaction();
	expect('VT287-23b', db.isTableExist(tableName), true);
	afterEach();

	/*//VT287-25
	beforeEach();
	afterEach();

	//VT287-26
	beforeEach();
	afterEach();

	//VT287-27
	beforeEach();
	afterEach();*/

	//VT287-28
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	var tableName = getRandomName();
	db.executeBatchSql('CREATE TABLE "' + tableName + '" (Id INTEGER NOT NULL PRIMARY KEY, EMPLOYEE TEXT, DESIGNATION VARCHAR)');
	db.executeBatchSql('INSERT INTO "' + tableName + '" (Id, EMPLOYEE, Designation) VALUES (1, "deva", "SystemEngineer"); INSERT INTO "' + tableName + '" (Id, EMPLOYEE, Designation) VALUES (2, "deva", "SystemEngineer"); INSERT INTO "' + tableName + '" (Id, EMPLOYEE, Designation) VALUES (3, "bhaktha", "SystemEngineer");');
	db.executeSql('DELETE FROM "' + tableName + '" WHERE ID = ?', [1]);
	expect('VT287-28', db.executeSql('SELECT * FROM "' + tableName + '" WHERE Id = 1'), []);
	afterEach();

	/*//VT287-29
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	
	        var tableName = getRandomName();
	        db.executeBatchSql('CREATE TABLE "' + tableName + '" (Id INTEGER NOT NULL PRIMARY KEY, EMPLOYEE TEXT, DESIGNATION VARCHAR)');
	        db.executeBatchSql('INSERT INTO "' + tableName + '" (Id, EMPLOYEE, Designation) VALUES (1, "deva", "SystemEngineer"); INSERT INTO "' + tableName + '" (Id, EMPLOYEE, Designation) VALUES (2, "deva", "SystemEngineer"); INSERT INTO "' + tableName + '" (Id, EMPLOYEE, Designation) VALUES (3, "bhaktha", "SystemEngineer");');
	        db.executeSql('ALTER TABLE "' + tableName + '" ADD COLUMN Manager');
	        db.executeSql('UPDATE "' + tableName + '" SET Manager = "Kumar Sunil"');
	
	        expect(db.executeSql('SELECT Manager FROM "' + tableName + '" WHERE Id=1')).toEqual([{Manager: 'Kumar Sunil'}]);
	afterEach();

	//VT287-30
	beforeEach();
	db = new Rho.Database(Rho.Application.databaseFilePath('local'), 'local');
	
	        var tableName = getRandomName();
	        db.executeSql('CREATE TABLE "' + tableName + '" (x INTEGER, y TEXT)');
	        db.destroyTable(tableName);
	        db.destroyTable(tableName);
	        expect(db.isTableExist(tableName)).toBe(false);
	afterEach();

	//VT287-31
	beforeEach();
	afterEach();

	//VT287-32
	beforeEach();
	afterEach();

	//VT287-33
	beforeEach();
	afterEach();

	//VT287-34
	beforeEach();
	afterEach();

	//VT287-35
	beforeEach();
	afterEach();

	//VT287-36
	beforeEach();
	afterEach();

	//VT287-37
	beforeEach();
	afterEach();

	//VT287-38
	beforeEach();
	afterEach();
	*/







};