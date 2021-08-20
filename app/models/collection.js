/**
 * author: zp
 * description: "收藏集"模块
 * date: 2021/7/31
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");

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

  // 获取某个用户的收藏夹列表
  static async getCollections({ pageIndex, pageSize, uid }) {
    const result = await Collection.findAndCountAll({
      order: [["created_at", "DESC"]],
      where: {
        userId: uid,
      },
      limit: Number(pageSize),
      offset: (Number(pageIndex) - 1) * Number(pageSize),
      attributes: ["id", "type", "number"],
    });

    return result;
  }

  // 获取某个收藏夹的信息
  static async getCollectionInfo(collectionId) {
    const data = await Collection.findOne({
      where: {
        id: collectionId,
      },
      attributes: ["id", "userId", "type", "number"],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
      ],
    });

    return data;
  }

  // 更新某个收藏夹的名字
  static async updateName(cid, uid, name) {
    const result = await Collection.update(
      {
        type: name,
      },
      {
        where: {
          id: cid,
          userId: uid,
        },
      }
    );

    return result;
  }

  // 删除收藏夹
  static async deleteCollection(cid, uid) {
    const result = await Collection.destroy({
      where: {
        id: cid,
        userId: uid,
      },
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

// 建立表关联关系
sequelize.models.Collection.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = {
  Collection,
};
