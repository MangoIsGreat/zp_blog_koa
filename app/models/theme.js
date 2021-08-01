/**
 * author: zp
 * description: “动态”主题
 * date: 2021/8/1
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Theme extends Model {}

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
