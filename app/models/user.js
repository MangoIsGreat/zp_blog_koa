const bcrypt = require("bcrypt");
const { sequelize } = require("../../core/db");

const { Sequelize, Model } = require("sequelize");

class User extends Model {}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    nickname: Sequelize.STRING,
    email: {
      type: Sequelize.STRING(128),
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      set(val) {
        const salt = bcrypt.genSaltSync(10);
        const psw = bcrypt.hashSync(val, salt);
        this.setDataValue(psw);
      },
    },
    openid: {
      type: Sequelize.STRING(64),
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "user",
  }
);

module.exports = {
  User,
};
