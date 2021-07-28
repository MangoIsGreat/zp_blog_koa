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

    if (status === "new") ranking = "updated_at";

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

  // 热门文章推荐
  static async getHotList(content) {
    const blog = await Blog.findOne({
      where: {
        id: content.blog,
      },
    });

    const list = await Blog.findAndCountAll({
      order: [["blogLikeNum", "DESC"]],
      where: {
        tag: blog.tag,
      },
      limit: 5,
      attributes: ["id", "title", "author", "tag", "blogLikeNum", "commentNum"],
    });

    return list;
  }

  // 相关文章推荐
  static async relatedList({ blogID, pageIndex, pageSize }) {
    const blog = await Blog.findOne({
      where: {
        id: blogID,
      },
    });

    // 多表查询(一对多)
    Blog.belongsTo(User, {
      foreignKey: "author",
    });

    Blog.belongsTo(Tag, {
      foreignKey: "tag",
      targetKey: "tagType",
    });

    const list = await Blog.findAndCountAll({
      order: [["blogReadNum", "DESC"]],
      where: {
        tag: blog.tag,
      },
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
        "id",
        "title",
        "author",
        "tag",
        "blogLikeNum",
        "blogReadNum",
        "commentNum",
        "description",
        "created_at",
        "titlePic",
      ],
    });

    return list;
  }

  // 获取某一篇文章
  static async getArticle(id) {
    // 多表查询(一对多)
    Blog.belongsTo(User, {
      foreignKey: "author",
    });

    Blog.belongsTo(Tag, {
      foreignKey: "tag",
      targetKey: "tagType",
    });

    const blogs = await Blog.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
          attributes: [
            "id",
            "nickname",
            "avatar",
            "profession",
            "signature",
            "blogReadNum",
            "blogLikeNum",
            "fansNum",
            "idolNum",
          ],
        },
        {
          model: Tag,
          attributes: ["tagName", "id"],
        },
      ],
      attributes: [
        "id",
        "title",
        "content",
        "author",
        "titlePic",
        "blogLikeNum",
        "blogReadNum",
        "created_at",
        "updated_at",
      ],
    });

    // 阅读数+1
    blogs.increment(["blogReadNum"], { by: 1 });

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
    commentNum: {
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
