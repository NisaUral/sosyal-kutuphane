const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ531k5O5b-dueDjjQ424m3aflyllW1RPNSg&s'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reset_token: {
      type: DataTypes.STRING,
      allowNull: true, // Boş olabilir
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true, // Boş olabilir
    },
},

 {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;