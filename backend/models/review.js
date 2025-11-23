const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Review (Yorum) tablosu
const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  content_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'contents',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true
});

module.exports = Review;