const assert = require('assert');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Trend = require('../models/trend.model');
const { serializePosts } = require('../serializers/post.serializer');
const { serializeUsers } = require('../serializers/user.serializer');

exports.search = async (req, res, next) => {
  try {
    const query = req.query.q;
    let page = req.query.p;
    if (!query) {
      res.json({
        posts: null,
      });
      return;
    }
    page = parseInt(page);
    if (query.startsWith('#')) {
      // posts containing hashtag
      const result = await Post.searchHashtag(query, page);
      // result direct return of find (empty array when no match)
      const posts = await serializePosts(result, req.user);
      console.log('search controller 1', posts);
      res.json({ posts });
      return;
    }
    if (query.startsWith('@')) {
      // posts containing @query or accounts matching query
      let posts = await Post.searchUserMention(query, page);
      let users = await User.searchUser(query);
      posts = await serializePosts(posts, req.user);
      console.log('search controller 2', posts);
      users = await serializeUsers(users, req.user);
      res.json({
        posts,
        users,
      });
      return;
    }

    // do a text search
    const result = await Post.searchText(query, page);
    // result is direct return of find()
    const posts = await serializePosts(result, req.user);
    console.log('search controller 3');
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};
exports.trends = async (req, res, next) => {
  try {
    const { woeid } = req.query;
    const trend = await Trend.findOne({ 'locations.woeid': woeid });
    res.json(trend);
  } catch (err) {
    next(err);
  }
};
exports.userSuggests = async (req, res, next) => {
  try {
    const { user } = req;
    assert.ok(user);
    let users = await User.getSuggestions({ user_id: user._id });
    users = await serializeUsers(users, req.user);
    res.json({
      users,
      more: false,
    });
  } catch (err) {
    next(err);
  }
};
