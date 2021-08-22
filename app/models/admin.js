const bcrypt = require("bcrypt");
const { sequelize } = require("../../core/db");

const { Sequelize, Model } = require("sequelize");

class Admin extends Model {
  static async verifyEmailPassword(email, plainPassword) {
    const user = await Admin.findOne({
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

  // 获取用户信息：
  static async getLoginUserInfo(account) {
    return await Admin.findOne({
      where: { email: account },
      attributes: ["id", "nickname", "created_at", "email", "avatar"],
    });
  }
}

Admin.init(
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
    auth_type: {
      type: Sequelize.INTEGER,
      defaultValue: 800, // 默认800(即“普通用户”)
    },
  },
  {
    sequelize,
    tableName: "admin",
  }
);

module.exports = {
  Admin,
};
