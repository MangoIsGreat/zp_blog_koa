const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class ReadHistory extends Model {
  // 创建浏览记录
  static async setHistory(params) {
    await ReadHistory.findOrCreate({
      where: {
        blogId: params.blog,
        userId: params.user,
      },
    });
  }

  //   获取用户浏览记录
  static async getReadHistory(params) {
    const result = [];

    const history = await ReadHistory.findAll({
      where: {
        userId: params.uid,
      },
      limit: Number(params.pageSize),
      offset: (Number(params.pageIndex) - 1) * Number(params.pageSize),
    });

    for (let i = 0; i < history.length; i++) {
      const data = await sequelize.models.Blog.getReadBlog(history[i].blogId);

      result.push(data);
    }

    return result;
  }
}

ReadHistory.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    blogId: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "readhistory",
  }
);

module.exports = {
  ReadHistory,
};
