const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Blog extends Model {
  async createBlog(content) {
    const blog = await Blog.create(content);

    return blog;
  }

  static async getHomePageBlogList({ where }, status, pageIndex, pageSize) {
    // 文章排序状态：
    let ranking = "blogReadNum";

    if (status === "new") ranking = "created_at";

    const blogs = await Blog.findAndCountAll({
      where,
      order: [[ranking, "DESC"]],
      offset: (pageIndex * 1 - 1) * pageSize,
      limit: pageSize * 1,
    });

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

  // 获取某一篇文章
  static async getArticle(id) {
    const blogs = await Blog.findOne({
      where: {
        id,
      },
    });

    // 阅读数+1
    blogs.increment(["blogReadNum"], { by: 1 }).then(function (user) {
      console.log("success");
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
  },
  {
    sequelize,
    tableName: "blog",
  }
);

module.exports = {
  Blog,
};
