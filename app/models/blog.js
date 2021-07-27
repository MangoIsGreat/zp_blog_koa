const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");
const { Tag } = require("./tag");

class Blog extends Model {
  // 创建博客
  async createBlog(content) {
    const blog = await Blog.create(content);

    return blog;
  }

  // 获取博客列表
  static async getHomePageBlogList({ where }, status, pageIndex, pageSize) {
    // 文章排序状态：
    let ranking = "blogReadNum";

    if (status === "new") ranking = "created_at";

    // 多表查询(一对多)
    Blog.belongsTo(User, {
      foreignKey: "author",
    });

    Blog.belongsTo(Tag, {
      foreignKey: "tag",
      targetKey: "tagType",
    });

    const blogs = await Blog.findAndCountAll({
      where,
      order: [[ranking, "DESC"]],
      offset: (pageIndex * 1 - 1) * pageSize,
      limit: pageSize * 1,
      include: [
        {
          model: User,
          attributes: ["nickname"],
        },
        {
          model: Tag,
          attributes: ["tagName"],
        },
      ],
      attributes: [
        "author",
        "blogLikeNum",
        "blogReadNum",
        "created_at",
        "description",
        "id",
        "tag",
        "title",
        "titlePic",
        "updated_at",
      ],
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
