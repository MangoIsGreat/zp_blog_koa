/**
 * author: zp
 * description: "收藏集"模块
 * date: 2021/7/31
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Collection extends Model {
  static async createCollection(content) {
    const collection = await Collection.findOne({
      where: {
        userId: content.userId,
        type: content.type,
      },
    });

    if (collection) {
      return {
        type: 1,
        msg: "收藏集名称已存在！",
      };
    }

    try {
      await Collection.create(content);
      return {
        type: 0,
        msg: "创建成功",
      };
    } catch (error) {
      return {
        type: -1,
        msg: "创建失败",
      };
    }
  }

  static async getCollection(content) {
    const result = await Collection.findAll({
      where: {
        userId: content.userId,
      },
      attributes: ["id", "type", "number", "created_at", "updated_at"],
    });

    return result;
  }
}

Collection.init(
  {
    id: {
      type: Sequelize.UUID, // 收藏集id
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    userId: {
      type: Sequelize.STRING, // 收藏集所在用户id
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING, // 收藏集名
      allowNull: false,
    },
    number: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "collection",
  }
);

module.exports = {
  Collection,
};
