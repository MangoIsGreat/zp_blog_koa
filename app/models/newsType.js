const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class NewsType extends Model {
  // 创建动态类型
  static async createNewsType(content) {
    await NewsType.create(content);
  }

  // 获取“资讯”分类标签
  static async getNewsTypeList() {
    const types = await NewsType.findAndCountAll({
      order: [["tagType", "ASC"]],
      attributes: ["id", "tag_type", "tag_name"],
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
    tagType: {
      type: Sequelize.INTEGER,
    },
    tagName: {
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
