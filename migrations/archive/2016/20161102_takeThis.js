let migrationName = '20161102_takeThis.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award Take This ladder items to participants in this month's challenge
 */

let mongo = require('mongoskin');

let connectionString = 'mongodb://localhost:27017/syndrobox?auto_reconnect=true'; // FOR TEST DATABASE

let dbUsers = mongo.db(connectionString).collection('users');

// specify a query to limit the affected users (empty for all users):
let query = {
  migration: {$ne: migrationName},
  challenges: {$in: ['d1be0965-e909-4d30-82fa-9a0011f885b2']},
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
let fields = {
  'items.gear.owned': 1,
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

  if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.body_special_takeThis': false};
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.head_special_takeThis': false};
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.armor_special_takeThis': false};
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.weapon_special_takeThis': false};
  } else {
    set = {migration: migrationName, 'items.gear.owned.shield_special_takeThis': false};
  }

  dbUsers.update({_id: user._id}, {$set: set});

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

