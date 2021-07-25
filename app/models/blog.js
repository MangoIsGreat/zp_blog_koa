const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Blog extends Model {
  async createBlog(content) {
    const blog = await Blog.create(content);

    return blog;
  }

  static async getHomePageBlogList() {
    const blogs = await Blog.findAndCountAll();

    return blogs;
  }

  async getRecomList(content) {
    const blogs = await Blog.findAll({
      where: {
        tag: content.profession,
      },
      limit: 8,
    });

    return blogs;
  }

  async getHotList(content) {
    const blogs = await Blog.findAll({
      order: [["blogLikeNum", "DESC"]],
      where: {
        tag: content.profession,
      },
      limit: 5,
    });

    return blogs;
  }
}

Blog.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tag: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    titlePic: {
      type: Sequelize.STRING,
    },
    blogLikeNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    blogReadNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    cover_url: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "blog",
  }
);

module.exports = {
  Blog,
};
