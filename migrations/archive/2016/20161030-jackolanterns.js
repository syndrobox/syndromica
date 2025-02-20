let migrationName = '20161030-jackolanterns.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * set the newStuff flag in all user accounts so they see a Bailey message
 */

let mongo = require('mongoskin');

let connectionString = 'mongodb://localhost:27017/syndrobox?auto_reconnect=true'; // FOR TEST DATABASE

let dbUsers = mongo.db(connectionString).collection('users');

// specify a query to limit the affected users (empty for all users):
let query = {
  'auth.timestamps.loggedin': {$gt: new Date('2016-10-01')}, // remove when running migration a second time
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
let fields = {
  migration: 1,
  'items.pets.JackOLantern-Base': 1,
  'items.mounts.JackOLantern-Base': 1,
};

console.warn('Updating users...');
let progressCount = 1000;
let count = 0;
dbUsers.findEach(query, fields, {batchSize: 250}, function (err, user) {
  if (err) {
    return exiting(1, `ERROR! ${  err}`);
  }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    setTimeout(displayData, 300000);
    return;
  }
  count++;

  // specify user data to change:
  let set = {};
  let inc = {};
  if (user.migration !== migrationName) {
    if (user.items.mounts['JackOLantern-Base']) {
      set = {migration: migrationName, 'items.pets.JackOLantern-Ghost': 5};
    } else if (user.items.pets['JackOLantern-Base']) {
      set = {migration: migrationName, 'items.mounts.JackOLantern-Base': true};
    } else {
      set = {migration: migrationName, 'items.pets.JackOLantern-Base': 5};
    }
    inc = {
      'items.food.Candy_Base': 1,
      'items.food.Candy_CottonCandyBlue': 1,
      'items.food.Candy_CottonCandyPink': 1,
      'items.food.Candy_Desert': 1,
      'items.food.Candy_Golden': 1,
      'items.food.Candy_Red': 1,
      'items.food.Candy_Shade': 1,
      'items.food.Candy_Skeleton': 1,
      'items.food.Candy_White': 1,
      'items.food.Candy_Zombie': 1,
    };
  }

  dbUsers.update({_id: user._id}, {$set: set, $inc: inc});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
});


function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
}


function exiting (code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) {
    msg = 'ERROR!';
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else      {
      console.log(msg);
    }
  }
  process.exit(code);
}

