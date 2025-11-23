const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Activity (Aktivite) tablosu - Feed için
const Activity = sequelize.define('Activity', {
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
  activity_type: {
    type: DataTypes.ENUM('rating', 'review', 'library_add'),
    allowNull: false,
    comment: 'rating=Puanlama, review=Yorum, library_add=Kütüphaneye ekleme'
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
  rating_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ratings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'reviews',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'activities',
  timestamps: true,
  underscored: true
});

module.exports = Activity;