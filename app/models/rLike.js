/**
 * author: zp
 * description: “博客评论回复”点赞功能(reply like)
 * date: 2021/7/30
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { BReply } = require("./bReply");

class RLike extends Model {
  // 点赞博客回复功能：
  static async likeReply(content) {
    const like = await RLike.findOne({
      where: { replyId: content.replyId, userId: content.user },
    });

    const reply = await BReply.findOne({
      where: {
        id: content.replyId,
      },
    });

    // 点赞记录存在&已点赞
    if (like && like.isLike) {
      await reply.decrement("likeNum", { by: 1 });

      await RLike.update(
        { isLike: false },
        { where: { replyId: content.replyId, userId: content.user } }
      );

      return "cancel";
    }

    // 点赞记录存在&未点赞
    if (like && !like.isLike) {
      await reply.increment("likeNum", { by: 1 });

      await RLike.update(
        { isLike: true },
        { where: { replyId: content.replyId, userId: content.user } }
      );

      return "ok";
    }

    // 未点过赞
    if (!like) {
      await reply.increment("likeNum", { by: 1 });

      await RLike.create({
        replyId: content.replyId,
        userId: content.user,
        isLike: true,
      });

      return "ok";
    }

    return false;
  }

  // 获取所有点赞记录
  static async getRecord(where) {
    const records = await RLike.findAll({
      where,
    });

    return records;
  }
}

RLike.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    replyId: {
      type: Sequelize.STRING, // 评论回复id
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING, // 点赞用户
      allowNull: false,
    },
    isLike: {
      type: Sequelize.BOOLEAN, // 是否点赞
    },
  },
  {
    sequelize,
    tableName: "rlike",
  }
);

module.exports = {
  RLike,
};
