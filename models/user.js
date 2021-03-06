var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');


module.exports = function(sequelize, DateTypes) {
  var user = sequelize.define('user', {
      email: {
          type: DateTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
              isEmail: true
          }
      },
      salt: {
          type: DateTypes.STRING
      },
      password_hash: {
          type: DateTypes.STRING
      },
      password: {
          type: DateTypes.VIRTUAL,
          allowNull: false,
          validate: {
              len: [7,100]
          },
          set: function(value) {
              var salt = bcrypt.genSaltSync(10);
              var hashedPass = bcrypt.hashSync(value, salt);

              this.setDataValue('password', value);
              this.setDataValue('salt', salt);
              this.setDataValue('password_hash', hashedPass);
          }
      }}, {
          hooks: {
              beforeValidate: function(user, options) {
                  if(typeof user.email === 'string') {
                      user.email = user.email.toLowerCase();
                  }
              }
          },
          classMethods: {
              authenticate: function(body) {
                  return new Promise(function (resolve, reject) {
                      if(typeof body.email === 'string') {
                          body.email = body.email.trim().toLowerCase();
                      } else {
                          return reject();
                      }

                      if(typeof body.password === 'string') {
                          body.password = body.password.trim();
                      } else {
                          return reject();
                      }

                      user.findOne({
                          where: {
                              email: body.email
                          }
                      }).then(function(user) {
                          if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                              return reject();
                          } else {
                              return resolve(user);
                          }
                      }, function(e) {
                          return reject();
                      });
                  })
              },
              findByToken: function(token) {
                  return new Promise(function(resolve, reject) {
                      try {
                        var decodedJwt = jwt.verify(token, 'qwerty098');
                          var bytes = cryptojs.AES.decrypt(decodedJwt.token, '123abc');
                          var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                          user.findById(tokenData.id).then(function(user) {
                            if(user) {
                                resolve(user);
                            } else {
                                reject();
                            }
                          }, function(e) {
                              reject();
                          })
                      } catch (e) {
                          reject();
                      }
                  })
              }
          },
          instanceMethods: {
              toPublicJSON: function() {
                  var json = this.toJSON();
                  return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
              },
              generateToken: function(type) {
                  if(!_.isString(type)) {
                      return undefined;
                  }

                  try {
                      var stringData = JSON.stringify({
                          id: this.get('id'),
                          type: type
                      });
                      var encryptedData = cryptojs.AES.encrypt(stringData, '123abc').toString();
                      var token = jwt.sign({
                          token: encryptedData
                      }, 'qwerty098');

                      return token;
                  } catch(e) {
                      console.error(e);
                      return undefined;
                  }
              }
          }
  });

    return user;
};
