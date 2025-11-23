const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Library (Kütüphane) tablosu
const Library = sequelize.define('Library', {
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
  status: {
    type: DataTypes.ENUM('watched', 'to_watch', 'read', 'to_read'),
    allowNull: false,
    comment: 'watched=İzledim, to_watch=İzlenecek, read=Okudum, to_read=Okunacak'
  },
  added_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'libraries',
  timestamps: false,  // Bu tabloda timestamp istemiyoruz
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'content_id', 'status']  // Aynı içerik aynı statüde 2 kez eklenemez
    }
  ]
});

module.exports = Library;