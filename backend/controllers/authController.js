const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const { User } = require('../models');

//const { forgotPassword, resetPassword } = require('../../frontend/src/services/authService');

const { Op } = require('sequelize'); // <-- BUNU EKLE

const crypto = require('crypto');

const sendEmail = require('../utils/sendEmail');



// Kullanıcı Kaydı (Register)

exports.register = async (req, res) => {

  try {

    const { username, email, password } = req.body;



    // 1. Boş alan kontrolü

    if (!username || !email || !password) {

      return res.status(400).json({

        success: false,

        message: 'Tüm alanları doldurun!'

      });

    }



    // 2. Email formatı kontrolü

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

      return res.status(400).json({

        success: false,

        message: 'Geçerli bir email adresi girin!'

      });

    }



    // 3. Şifre uzunluğu kontrolü (en az 6 karakter)

    if (password.length < 6) {

      return res.status(400).json({

        success: false,

        message: 'Şifre en az 6 karakter olmalı!'

      });

    }



    // 4. Kullanıcı zaten var mı?

    const existingUser = await User.findOne({

      where: {

        [require('sequelize').Op.or]: [

          { email: email },

          { username: username }

        ]

      }

    });



    if (existingUser) {

      if (existingUser.email === email) {

        return res.status(400).json({

          success: false,

          message: 'Bu email zaten kullanımda!'

        });

      }

      if (existingUser.username === username) {

        return res.status(400).json({

          success: false,

          message: 'Bu kullanıcı adı zaten alınmış!'

        });

      }

    }



    // 5. Şifreyi hashle (güvenli hale getir)

    const hashedPassword = await bcrypt.hash(password, 10);



    // 6. Yeni kullanıcı oluştur

    const newUser = await User.create({

      username,

      email,

      password: hashedPassword

    });



    // 7. JWT Token oluştur

    const token = jwt.sign(

      {

        id: newUser.id,

        username: newUser.username,

        email: newUser.email

      },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRE }

    );



    // 8. Başarılı yanıt

    res.status(201).json({

      success: true,

      message: 'Kayıt başarılı!',

      token,

      user: {

        id: newUser.id,

        username: newUser.username,

        email: newUser.email,

        avatar_url: newUser.avatar_url

      }

    });



  } catch (error) {

    console.error('Kayıt hatası:', error);

    res.status(500).json({

      success: false,

      message: 'Sunucu hatası!',

      error: error.message

    });

  }

};



// Kullanıcı Girişi (Login)

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;



    // 1. Boş alan kontrolü

    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: 'Email ve şifre gerekli!'

      });

    }



    // 2. Kullanıcıyı bul

    const user = await User.findOne({ where: { email } });



    if (!user) {

      return res.status(401).json({

        success: false,

        message: 'Email veya şifre hatalı!'

      });

    }



    // 3. Şifreyi kontrol et

    const isPasswordValid = await bcrypt.compare(password, user.password);



    if (!isPasswordValid) {

      return res.status(401).json({

        success: false,

        message: 'Email veya şifre hatalı!'

      });

    }



    // 4. JWT Token oluştur

    const token = jwt.sign(

      {

        id: user.id,

        username: user.username,

        email: user.email

      },

      process.env.JWT_SECRET,

      { expiresIn: process.env.JWT_EXPIRE }

    );



    // 5. Başarılı giriş

    res.status(200).json({

      success: true,

      message: 'Giriş başarılı!',

      token,

      user: {

        id: user.id,

        username: user.username,

        email: user.email,

        avatar_url: user.avatar_url,

        bio: user.bio

      }

    });



  } catch (error) {

    console.error('Giriş hatası:', error);

    res.status(500).json({

      success: false,

      message: 'Sunucu hatası!',

      error: error.message

    });

  }

};



// Token ile Kullanıcı Bilgisi Al (getMe)

exports.getMe = async (req, res) => {

  try {

    // req.user middleware'den geliyor

    const user = await User.findByPk(req.user.id, {

      attributes: { exclude: ['password'] }  // Şifreyi gönderme

    });



    if (!user) {

      return res.status(404).json({

        success: false,

        message: 'Kullanıcı bulunamadı!'

      });

    }



    res.status(200).json({

      success: true,

      user

    });



  } catch (error) {

    console.error('GetMe hatası:', error);

    res.status(500).json({

      success: false,

      message: 'Sunucu hatası!',

      error: error.message

    });

  }

};



// Şifre sıfırlama isteği

// Şifre sıfırlama isteği (Sequelize ile)

// Şifre sıfırlama isteği (6 Haneli Kod & 3 Dakika Geçerlilik)

exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;



    if (!email) {

      return res.status(400).json({ success: false, message: 'Email gerekli!' });

    }



    const user = await User.findOne({ where: { email } });



    if (!user) {

      return res.json({ // Kullanıcı bulunamasa bile güvenlik için OK dön

        success: true,

        message: 'Eğer bu email kayıtlıysa, şifre sıfırlama kodu gönderildi.'

      });

    }



    // 1. 6 haneli rastgele kod oluştur

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. 3 dakika geçerlilik süresi ayarla

    const resetExpires = new Date(Date.now() + 180000);



    // 3. Kodu ve süresini veritabanına kaydet

    await user.update({

      reset_token: resetToken,

      reset_token_expires: resetExpires

    });

   

    // 4. Kodu içeren e-postayı hazırla

    const message = `Sosyal Kütüphane şifre sıfırlama kodunuz: \n\n ${resetToken} \n\n Bu kod 3 dakika geçerlidir.`;



    // 5. E-postayı gönder

    try {

      await sendEmail({

        email: user.email,

        subject: 'Sosyal Kütüphane - Şifre Sıfırlama Kodu',

        message: message

      });

     

      // BAŞARILI: Yanıtı gönder ve fonksiyondan çık

      return res.json({

        success: true,

        message: 'Şifre sıfırlama kodu email adresinize gönderildi.'

      });



    } catch (err) { // Sadece email gönderme hatası

      console.error('Email gönderme hatası:', err);

      // Token'ı geri al (mail gitmediyse)

      await user.update({ reset_token: null, reset_token_expires: null });

     

      // BAŞARISIZ: Yanıtı gönder ve fonksiyondan çık

      return res.status(500).json({ message: 'Email gönderilemedi, sunucu hatası.' });

    }



  } catch (error) { // Genel veritabanı veya kod hatası

    console.error('Genel şifre sıfırlama hatası:', error);

    return res.status(500).json({ message: 'Sunucu hatası' });

  }

};



// Şifre sıfırla

// Şifre sıfırla (Sequelize ile)

// backend/controllers/authController.js içindeki resetPassword fonksiyonu

// backend/controllers/authController.js -> resetPassword fonksiyonu

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    console.log('🔵 İSTEK GELDİ:', { email, resetToken });

    // ADIM 1: Sadece email ile kullanıcıyı bul (Token kontrolü yapmadan)
    const user = await User.findOne({ where: { email } });

    // Kullanıcı hiç yoksa
    if (!user) {
      console.log('❌ HATA: Bu email adresi veritabanında yok!');
      return res.status(400).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // ADIM 2: Veritabanındaki durumu incele
    console.log('🧐 VERİTABANI DURUMU:');
    console.log('-> DB\'deki Token:', user.reset_token);
    console.log('-> DB\'deki Token Tipi:', typeof user.reset_token);
    console.log('-> Gelen Token:', resetToken);
    console.log('-> Gelen Token Tipi:', typeof resetToken);
    console.log('-> Eşleşiyor mu?:', user.reset_token == resetToken); // Gevşek eşleşme kontrolü

    // ADIM 3: Manuel Eşleştirme Kontrolü
    // Not: String/Number farkını yoksaymak için '==' kullandım
    if (user.reset_token != resetToken) { 
      console.log('❌ HATA: Tokenlar uyuşmuyor!');
      return res.status(400).json({ message: 'Kod hatalı!' });
    }

    // ADIM 4: Süre Kontrolü
    const now = new Date();
    console.log('-> DB Süresi:', user.reset_token_expires);
    console.log('-> Şu an:', now);
    
    if (!user.reset_token_expires || now > user.reset_token_expires) {
      console.log('❌ HATA: Süre dolmuş veya süre ayarlanmamış!');
      return res.status(400).json({ message: 'Kodun süresi dolmuş!' });
    }

    // ADIM 5: Her şey yolundaysa şifreyi değiştir
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });

    console.log('✅ BAŞARILI: Şifre değişti.');
    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi!'
    });

  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};