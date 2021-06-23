/**
 * author: zp
 * description: “博客”点赞功能
 * date: 2021/6/23
 */
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Blog } = require("./blog");

class BLike extends Model {
  async likeBlog(content) {
    const like = await BLike.findOne({
      where: { blog: content.blog, user: content.user },
    });

    if (like) {
      return null;
    }

    const blog = await Blog.findOne({
      where: {
        id: content.blog,
      },
    });

    await blog.increment("blogLikeNum", { by: 1 });

    const result = await BLike.create(content);

    return result;
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
  },
  {
    sequelize,
    tableName: "blike",
  }
);

module.exports = {
    BLike,
};
