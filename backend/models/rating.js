const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Rating (Puanlama) tablosu
const Rating = sequelize.define('Rating', {
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
    onDelete: 'CASCADE'  // Kullanıcı silinirse puanları da silinir
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,   // En az 1
      max: 10   // En fazla 10
    }
  }
}, {
  tableName: 'ratings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'content_id']  // Bir kullanıcı bir içeriğe sadece 1 puan verebilir
    }
  ]
});

module.exports = Rating;