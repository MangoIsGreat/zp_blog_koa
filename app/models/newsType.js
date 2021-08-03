const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class NewsType extends Model {
  static async getNewsTypeList() {
    const types = await NewsType.findAndCountAll({
      order: [["newsType", "ASC"]],
      attributes: ["id", "newsType", "newsName"],
    });

    return types;
  }
}

NewsType.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    newsType: {
      type: Sequelize.INTEGER,
    },
    newsName: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "newstype",
  }
);

module.exports = {
  NewsType,
};
