/**
 * author: zp
 * description: “动态”主题
 * date: 2021/8/1
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Theme extends Model {
  // 创建动态类型
  static async createTheme(content) {
    await Theme.create(content);
  }

  // 获取“动态”类型列表
  static async getThemeList() {
    return await Theme.findAll({
      attributes: ["id", "themeName", "created_at", "updated_at"],
    });
  }
}

Theme.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    themeName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "theme",
  }
);

module.exports = {
  Theme,
};
