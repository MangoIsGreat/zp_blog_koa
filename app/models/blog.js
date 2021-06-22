const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Blog extends Model {
  async createBlog(content) {
    const blog = await Blog.create(content);

    return blog;
  }

  static async getHomePageBlogList() {
    const blogs = await Blog.findAll();

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
    }
  },
  {
    sequelize,
    tableName: "blog",
  }
);

module.exports = {
  Blog,
};
