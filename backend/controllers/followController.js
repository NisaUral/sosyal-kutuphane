const { Follow, User } = require('../models');

// Kullanıcıyı Takip Et
exports.followUser = async (req, res) => {
  try {
    const { user_id } = req.params;  // Takip edilecek kullanıcı
    const follower_id = req.user.id;  // Takip eden (giriş yapan)

    // Kendini takip edemez
    if (parseInt(user_id) === follower_id) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi takip edemezsiniz!'
      });
    }

    // Kullanıcı var mı?
    const userToFollow = await User.findByPk(user_id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    // Zaten takip ediyor mu?
    const existingFollow = await Follow.findOne({
      where: {
        follower_id,
        following_id: user_id
      }
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcıyı zaten takip ediyorsunuz!'
      });
    }

    // Takip et
    const follow = await Follow.create({
      follower_id,
      following_id: user_id
    });

    res.status(201).json({
      success: true,
      message: `${userToFollow.username} takip edildi!`,
      follow
    });

  } catch (error) {
    console.error('Takip etme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Takip edilirken hata oluştu',
      error: error.message
    });
  }
};

// Takipten Çık
exports.unfollowUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const follower_id = req.user.id;

    const follow = await Follow.findOne({
      where: {
        follower_id,
        following_id: user_id
      }
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Bu kullanıcıyı zaten takip etmiyorsunuz!'
      });
    }

    await follow.destroy();

    res.status(200).json({
      success: true,
      message: 'Takipten çıkıldı'
    });

  } catch (error) {
    console.error('Takipten çıkma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Takipten çıkılırken hata oluştu',
      error: error.message
    });
  }
};

// Takipçileri Getir (Beni kimler takip ediyor?)
exports.getFollowers = async (req, res) => {
  try {
    const { user_id } = req.params;

    const followers = await Follow.findAll({
      where: { following_id: user_id },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'username', 'avatar_url', 'bio']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: followers.length,
      followers: followers.map(f => f.follower)
    });

  } catch (error) {
    console.error('Takipçiler getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Takipçiler alınamadı',
      error: error.message
    });
  }
};

// Takip Edilenleri Getir (Ben kimleri takip ediyorum?)
exports.getFollowing = async (req, res) => {
  try {
    const { user_id } = req.params;

    const following = await Follow.findAll({
      where: { follower_id: user_id },
      include: [{
        model: User,
        as: 'followingUser',
        attributes: ['id', 'username', 'avatar_url', 'bio']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: following.length,
      following: following.map(f => f.followingUser)
    });

  } catch (error) {
    console.error('Takip edilenler getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Takip edilenler alınamadı',
      error: error.message
    });
  }
};

// Takip Durumunu Kontrol Et
exports.checkFollowStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const follower_id = req.user.id;

    const isFollowing = await Follow.findOne({
      where: {
        follower_id,
        following_id: user_id
      }
    });

    res.status(200).json({
      success: true,
      isFollowing: !!isFollowing
    });

  } catch (error) {
    console.error('Takip kontrol hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kontrol edilemedi',
      error: error.message
    });
  }
};

// Takip İstatistikleri
exports.getFollowStats = async (req, res) => {
  try {
    const { user_id } = req.params;

    const followerCount = await Follow.count({
      where: { following_id: user_id }
    });

    const followingCount = await Follow.count({
      where: { follower_id: user_id }
    });

    res.status(200).json({
      success: true,
      stats: {
        followers: followerCount,
        following: followingCount
      }
    });

  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı',
      error: error.message
    });
  }
};
module.exports = {
  followUser: exports.followUser,
  unfollowUser: exports.unfollowUser,
  getFollowers: exports.getFollowers,
  getFollowing: exports.getFollowing,
  checkFollowStatus: exports.checkFollowStatus,
  getFollowStats: exports.getFollowStats
};