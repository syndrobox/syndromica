let migrationName = '20150124_mountmaster_fix.js';
let authorName = 'Alys'; // in case script author needs to know when their ...
let authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; // ... own data is done

/**
 * https://github.com/Syndrobox/syndrobox/pull/4374#issuecomment-71038795
 * Convert false to null for mounts that used to be owned.
 */

let dbserver = 'localhost:27017'; // CHANGE THIS FOR PRODUCTION DATABASE

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

let mongo = require('mongoskin');
let _ = require('lodash');

let dbUsers = mongo.db(`${dbserver  }/syndrobox?auto_reconnect`).collection('users');

let query = {
  'items.mounts': {$exists: true},
};

let fields = {
  'items.mounts': 1,
};

let animals = ['Wolf-Base', 'Wolf-White', 'Wolf-Desert', 'Wolf-Red', 'Wolf-Shade', 'Wolf-Skeleton', 'Wolf-Zombie', 'Wolf-CottonCandyPink', 'Wolf-CottonCandyBlue', 'Wolf-Golden', 'TigerCub-Base', 'TigerCub-White', 'TigerCub-Desert', 'TigerCub-Red', 'TigerCub-Shade', 'TigerCub-Skeleton', 'TigerCub-Zombie', 'TigerCub-CottonCandyPink', 'TigerCub-CottonCandyBlue', 'TigerCub-Golden', 'PandaCub-Base', 'PandaCub-White', 'PandaCub-Desert', 'PandaCub-Red', 'PandaCub-Shade', 'PandaCub-Skeleton', 'PandaCub-Zombie', 'PandaCub-CottonCandyPink', 'PandaCub-CottonCandyBlue', 'PandaCub-Golden', 'LionCub-Base', 'LionCub-White', 'LionCub-Desert', 'LionCub-Red', 'LionCub-Shade', 'LionCub-Skeleton', 'LionCub-Zombie', 'LionCub-CottonCandyPink', 'LionCub-CottonCandyBlue', 'LionCub-Golden', 'Fox-Base', 'Fox-White', 'Fox-Desert', 'Fox-Red', 'Fox-Shade', 'Fox-Skeleton', 'Fox-Zombie', 'Fox-CottonCandyPink', 'Fox-CottonCandyBlue', 'Fox-Golden', 'FlyingPig-Base', 'FlyingPig-White', 'FlyingPig-Desert', 'FlyingPig-Red', 'FlyingPig-Shade', 'FlyingPig-Skeleton', 'FlyingPig-Zombie', 'FlyingPig-CottonCandyPink', 'FlyingPig-CottonCandyBlue', 'FlyingPig-Golden', 'Dragon-Base', 'Dragon-White', 'Dragon-Desert', 'Dragon-Red', 'Dragon-Shade', 'Dragon-Skeleton', 'Dragon-Zombie', 'Dragon-CottonCandyPink', 'Dragon-CottonCandyBlue', 'Dragon-Golden', 'Cactus-Base', 'Cactus-White', 'Cactus-Desert', 'Cactus-Red', 'Cactus-Shade', 'Cactus-Skeleton', 'Cactus-Zombie', 'Cactus-CottonCandyPink', 'Cactus-CottonCandyBlue', 'Cactus-Golden', 'BearCub-Base', 'BearCub-White', 'BearCub-Desert', 'BearCub-Red', 'BearCub-Shade', 'BearCub-Skeleton', 'BearCub-Zombie', 'BearCub-CottonCandyPink', 'BearCub-CottonCandyBlue', 'BearCub-Golden']; // all Gen1 mounts

console.warn('Updating users...');
let progressCount = 1000;
let count = 0;
dbUsers.findEach(query, fields, {batchSize: 250}, function (err, user) {
  if (err) {
    return exiting(1, `ERROR! ${  err}`);
  }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    return displayData();
  }
  count++;

  let mounts = user.items.mounts;
  let changed = false;
  for (let a in animals) {
    if (mounts[animals[a]] === false) {
      mounts[animals[a]] = null;
      changed = true;
    }
  }

  if (changed) {
    dbUsers.update(
      { _id: user._id},
      {
        $set: { migration: migrationName,
                'items.mounts': mounts,
        },
      }
    );
  }

  // var set = {'migration': migrationName};
  // var inc = {'xyz':1, _v:1};
  // dbUsers.update({_id:user._id}, {$set:set, $inc:inc});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
  if (user._id === '9') console.warn('lefnire'  + ' processed');
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
