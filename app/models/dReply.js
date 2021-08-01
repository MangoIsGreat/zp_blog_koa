/**
 * author: zp
 * description: 动态评论模块 -- 回复表
 * date: 2021/8/1
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class DReply extends Model {
  // 评论"博客评论"
  static async reply(content) {
    await DReply.create(content);

    return "评论成功";
  }
}

DReply.init(
  {
    id: {
      type: Sequelize.UUID, // 回复Id
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    dynamicId: {
      type: Sequelize.STRING, // 动态id
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
    tableName: "dreply",
  }
);

module.exports = {
  DReply,
};
