const mongoose = require('mongoose');
const { serializeUser } = require('./user.serializer');

exports.serializePost = async (post, client, level = 0) => {
  if (level > 1) {
    return;
  }
  if (!post) { return; }
  if (!post instanceof mongoose.Document) { throw Error('Unknown post type'); }
  post = await post
    .populate('user')
    .populate('retweeted_status')
    .populate('quoted_status')
    .execPopulate();

  // serialize embedded posts
  const retweeted_status = await this.serializePost(post.retweeted_status, client, level + 1);
  const quoted_status = await this.serializePost(post.quoted_status, client, level + 1);

  // serialize user field
  if (!post.user) { throw Error('Post doesnt have a user field'); }
  const user = await serializeUser(post.user, client);

  post = post.toObject();
  // serialize post if necessary
  const favorited = await mongoose.model('Friendship').isLiked(client && client._id, post._id);
  const retweeted = await mongoose.model('Friendship').isReposted(client && client._id, post._id);
  return ({
    ...post,
    favorited,
    retweeted,
    user,
    retweeted_status,
    quoted_status,
  });
};
exports.serializePosts = async (client, posts = []) => {
  if (!posts instanceof Array) { // includes CoreDocumentArray
    throw Error('Unknown type');
  }
  return Promise.all(posts.map((post) => this.serializePost(post, client)));
};
