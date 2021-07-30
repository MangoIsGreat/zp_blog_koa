/**
 * author: zp
 * description: 博文评论模块 -- 回复表
 * date: 2021/7/29
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class BReply extends Model {
  // 评论"博客评论"
  static async reply(content) {
    BReply.create(content);

    return "评论成功";
  }
}

BReply.init(
  {
    id: {
      type: Sequelize.UUID, // 回复Id
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    blogId: {
      type: Sequelize.STRING, // 博客id
      allowNull: false,
    },
    commentId: {
      type: Sequelize.STRING, // 评论id
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT, // 回复内容
    },
    fromUid: {
      type: Sequelize.STRING, // 回复人id
      allowNull: false,
    },
    toUid: {
      type: Sequelize.STRING, // 目标用户id
      allowNull: false,
    },
    likeNum: {
      type: Sequelize.INTEGER, // 被点赞数量
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "breply",
  }
);

module.exports = {
  BReply,
};
