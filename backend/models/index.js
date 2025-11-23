const User = require('./user');
const Content = require('./content');
const Rating = require('./rating');
const Review = require('./review');
const Library = require('./library');
const Follow = require('./follow');
const Activity = require('./activity');

// İlişkiler
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Library, { foreignKey: 'user_id', as: 'library' });
Library.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Activity, { foreignKey: 'user_id', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Content.hasMany(Rating, { foreignKey: 'content_id', as: 'ratings' });
Rating.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });

Content.hasMany(Review, { foreignKey: 'content_id', as: 'reviews' });
Review.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });

Content.hasMany(Library, { foreignKey: 'content_id', as: 'libraries' });
Library.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });

Content.hasMany(Activity, { foreignKey: 'content_id', as: 'activities' });
Activity.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });

User.hasMany(Follow, { foreignKey: 'follower_id', as: 'following' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'followers' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'followingUser' });

Activity.belongsTo(Rating, { foreignKey: 'rating_id', as: 'rating' });
Activity.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });

module.exports = {
  User,
  Content,
  Rating,
  Review,
  Library,
  Follow,
  Activity
};