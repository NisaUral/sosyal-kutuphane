const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  external_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('movie', 'book'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  poster_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  director: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  genres: {
    type: DataTypes.JSON,
    allowNull: true
  },
  page_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  runtime: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'contents',
  timestamps: true,
  underscored: true
});

module.exports = Content;