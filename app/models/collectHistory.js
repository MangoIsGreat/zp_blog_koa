/**
 * author: zp
 * description: "收藏集"模块 -- 保存收藏记录
 * date: 2021/7/31
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Collection } = require("./collection");

class CollectHistory extends Model {
  // 收藏博客
  static async collectBlog(content) {
    const collection = await Collection.findOne({
      where: {
        id: content.collectionId,
      },
    });

    const history = await CollectHistory.findOne({
      where: {
        blogId: content.blogId,
        collectionId: content.collectionId,
      },
    });

    if (history) {
      return {
        type: 1,
        msg: "已经收藏过该文章至该收藏集！",
      };
    }

    try {
      await CollectHistory.create(content);

      // 收藏文章数+1
      collection.increment("number", { by: 1 });

      return {
        type: 0,
        msg: "收藏成功",
      };
    } catch (error) {
      return {
        type: -1,
        msg: "收藏失败",
      };
    }
  }

  // 获取用户已经收藏过的文章列表
  static async getCollectionBlog(content) {
    const result = await CollectHistory.findAndCountAll({
      where: {
        userId: content.userId,
        collectionId: content.collectionId,
      },
      limit: content.pageSize,
      offset: (content.pageIndex - 1) * content.pageSize,
    });

    return result;
  }
}

CollectHistory.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    collectionId: {
      type: Sequelize.STRING, // 收藏集id
      allowNull: false,
    },
    blogId: {
      type: Sequelize.STRING, // 博客Id
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING, // 用户Id
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "collectHistory",
  }
);

module.exports = {
  CollectHistory,
};
