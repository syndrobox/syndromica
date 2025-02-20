let migrationName = '20180130_habit_birthday.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award party robes: most recent user doesn't have of 2014-2018. Also cake!
 */

let monk = require('monk');
let connectionString = 'mongodb://localhost:27017/syndrobox?auto_reconnect=true'; // FOR TEST DATABASE
let dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    migration: {$ne: migrationName},
    'auth.timestamps.loggedin': {$gt: new Date('2018-01-01')}, // remove after first run to cover remaining users
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [ // specify fields we are interested in to limit retrieved data (empty if we're not reading data)
      'items.gear.owned',
    ],
  })
    .then(updateUsers)
    .catch(function (err) {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

let progressCount = 1000;
let count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  let userPromises = users.map(updateUser);
  let lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(function () {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  let push;
  let set = {migration: migrationName};

  if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday2017')) {
    set['items.gear.owned.armor_special_birthday2018'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2018', _id: monk.id()}};
  } else if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday2016')) {
    set['items.gear.owned.armor_special_birthday2017'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2017', _id: monk.id()}};
  } else if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday2015')) {
    set['items.gear.owned.armor_special_birthday2016'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2016', _id: monk.id()}};
  } else if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday')) {
    set['items.gear.owned.armor_special_birthday2015'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2015', _id: monk.id()}};
  } else {
    set['items.gear.owned.armor_special_birthday'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday', _id: monk.id()}};
  }

  let inc = {
    'items.food.Cake_Skeleton': 1,
    'items.food.Cake_Base': 1,
    'items.food.Cake_CottonCandyBlue': 1,
    'items.food.Cake_CottonCandyPink': 1,
    'items.food.Cake_Shade': 1,
    'items.food.Cake_White': 1,
    'items.food.Cake_Golden': 1,
    'items.food.Cake_Zombie': 1,
    'items.food.Cake_Desert': 1,
    'items.food.Cake_Red': 1,
    'achievements.habitBirthdays': 1,
  };

  dbUsers.update({_id: user._id}, {$set: set, $inc: inc, $push: push});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
}

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

module.exports = processUsers;

