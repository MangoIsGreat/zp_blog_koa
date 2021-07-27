/**
 * author: zp
 * description: “博客”点赞功能
 * date: 2021/6/23
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Blog } = require("./blog");

class BLike extends Model {
  // 点赞博客功能：
  static async likeBlog(content) {
    const like = await BLike.findOne({
      where: { blog: content.blog, user: content.user },
    });

    const blog = await Blog.findOne({
      where: {
        id: content.blog,
      },
    });

    // 点赞记录存在&已点赞
    if (like && like.isLike) {
      await blog.decrement("blogLikeNum", { by: 1 });

      await BLike.update(
        { isLike: false },
        { where: { blog: content.blog, user: content.user } }
      );

      return "cancel";
    }

    // 点赞记录存在&未点赞
    if (like && !like.isLike) {
      await blog.increment("blogLikeNum", { by: 1 });

      await BLike.update(
        { isLike: true },
        { where: { blog: content.blog, user: content.user } }
      );

      return "ok";
    }

    // 未点过赞
    if (!like) {
      await blog.increment("blogLikeNum", { by: 1 });

      await BLike.create({
        blog: content.blog,
        user: content.user,
        isLike: true,
      });

      return "ok";
    }

    // await blog.increment("blogLikeNum", { by: 1 });

    // const result = await BLike.create(content);

    return false;
  }
}

BLike.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    blog: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isLike: {
      type: Sequelize.BOOLEAN,
    },
  },
  {
    sequelize,
    tableName: "blike",
  }
);

module.exports = {
  BLike,
};
