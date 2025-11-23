const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Follow (Takip) tablosu
const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Takip eden kullanıcı'
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Takip edilen kullanıcı'
  }
}, {
  tableName: 'follows',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['follower_id', 'following_id']  // Aynı kişiyi 2 kez takip edemezsin
    }
  ]
});

module.exports = Follow;