/* eslint-disable no-console */
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20240731_naming_day';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  let set;
  let push;
  const inc = {
    'items.food.Cake_Base': 1,
    'items.food.Cake_CottonCandyBlue': 1,
    'items.food.Cake_CottonCandyPink': 1,
    'items.food.Cake_Desert': 1,
    'items.food.Cake_Golden': 1,
    'items.food.Cake_Red': 1,
    'items.food.Cake_Shade': 1,
    'items.food.Cake_Skeleton': 1,
    'items.food.Cake_White': 1,
    'items.food.Cake_Zombie': 1,
    'achievements.SyndromicaDays': 1,
  };

  if (user && user.items && user.items.gear && user.items.gear.owned && typeof user.items.gear.owned.back_special_namingDay2020 !== 'undefined') {
    set = { migration: MIGRATION_NAME };
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_namingDay_cake',
          title: 'Happy Naming Day!',
          text: 'To celebrate the day we became syndromica, we’ve awarded you some cake!',
          destination: '/inventory/items',
        },
        seen: false,
      },
    };
  } else if (user && user.items && user.items.gear && user.items.gear.owned && typeof user.items.gear.owned.body_special_namingDay2018 !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.gear.owned.back_special_namingDay2020': true };
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_namingDay_back',
          title: 'Happy Naming Day!',
          text: 'To celebrate the day we became syndromica, we’ve awarded you a Royal Purple Gryphon Tail and cake!',
          destination: '/inventory/equipment',
        },
        seen: false,
      },
    };
  } else if (user && user.items && user.items.gear && user.items.gear.owned && typeof user.items.gear.owned.head_special_namingDay2017 !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.gear.owned.body_special_namingDay2018': true };
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_namingDay_body',
          title: 'Happy Naming Day!',
          text: 'To celebrate the day we became syndromica, we’ve awarded you a Royal Purple Gryphon Cloak and cake!',
          destination: '/inventory/equipment',
        },
        seen: false,
      },
    };
  } else if (user && user.items && user.items.pets && typeof user.items.pets['Gryphon-RoyalPurple'] !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.gear.owned.head_special_namingDay2017': true };
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_namingDay_head',
          title: 'Happy Naming Day!',
          text: 'To celebrate the day we became syndromica, we’ve awarded you a Royal Purple Gryphon Helm and cake!',
          destination: '/inventory/equipment',
        },
        seen: false,
      },
    };
  } else if (user && user.items && user.items.mounts && typeof user.items.mounts['Gryphon-RoyalPurple'] !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.pets.Gryphon-RoyalPurple': 5 };
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_namingDay_pet',
          title: 'Happy Naming Day!',
          text: 'To celebrate the day we became syndromica, we’ve awarded you a Royal Purple Gryphon Pet and cake!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  } else {
    set = { migration: MIGRATION_NAME, 'items.mounts.Gryphon-RoyalPurple': true };
    push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_namingDay_mount',
          title: 'Happy Naming Day!',
          text: 'To celebrate the day we became syndromica, we’ve awarded you a Royal Purple Gryphon Mount and cake!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return user.updateOne({ $set: set, $inc: inc, $push: push }).exec();
  }

  return user.updateOne({ $set: set, $inc: inc }).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2024-07-01') },
  };

  const fields = {
    _id: 1,
    items: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
      .select(fields)
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1]._id,
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
}
