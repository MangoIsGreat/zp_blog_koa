const bcrypt = require("bcrypt");
const { sequelize } = require("../../core/db");

const { Sequelize, Model } = require("sequelize");

class User extends Model {
  static async verifyEmailPassword(email, plainPassword) {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new global.errs.AuthFailed("账号不存在");
    }
    const correct = bcrypt.compareSync(plainPassword, user.password);
    if (!correct) {
      throw new global.errs.AuthFailed("密码不正确");
    }
    return user;
  }

  static async getUserByOpenid(openid) {
    const user = await User.findOne({
      where: {
        openid,
      },
    });

    return user;
  }

  static async registerByOpenid(openid) {
    return await User.create({
      openid,
    });
  }
}

User.init(
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nickname: Sequelize.STRING,
    email: {
      type: Sequelize.STRING(128),
      unique: true,
    },
    avatar: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
      set(val) {
        const salt = bcrypt.genSaltSync(10);
        const psw = bcrypt.hashSync(val, salt);
        this.setDataValue("password", psw);
      },
    },
    openid: {
      type: Sequelize.STRING(64),
      unique: true,
    },
    auth_type: {
      type: Sequelize.INTEGER,
      defaultValue: 100, // 默认100(即“普通用户”)
    },
    profession: Sequelize.STRING(64), // 职业
    signature: Sequelize.STRING, // 签名
    blogLikeNum: {
      type: Sequelize.INTEGER ,
      defaultValue: 0,
    },
    blogReadNum: {
      type: Sequelize.INTEGER ,
      defaultValue: 0,
    },
    fansNum: {
      type: Sequelize.INTEGER ,
      defaultValue: 0,
    },
    idolNum: {
      type: Sequelize.INTEGER ,
      defaultValue: 0,
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
