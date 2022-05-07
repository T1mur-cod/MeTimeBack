const mongoose = require('mongoose');

/**
 * serializes user with fields required by client user
 */
exports.serializeUser = async (user, client = null) => {
  if (!user) { return; }

  if (user.toObject) { user = user.toObject(); }
  const followers_count = await mongoose.model('Friendship').countFollowers(user._id);
  const friends_count = await mongoose.model('Friendship').countFriends(user._id);
  const statuses_count = await mongoose.model('User').countPosts(user._id);
  const following = await mongoose.model('Friendship').isFollowing(client && client._id, user._id);
  const notifications_enabled_device_count = await mongoose.model('User').notificationDevices(user._id);
  return ({
    ...user,
    following,
    followers_count,
    friends_count,
    statuses_count,
    notifications_enabled_device_count,
  });
};
exports.serializeUsers = async (client, users = []) => {
  if (!users instanceof Array) { throw Error('Unknown type'); }
  return Promise.all(users.map((user) => this.serializeUser(user, client)));
};
