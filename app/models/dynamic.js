const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { Fans } = require("./fans");

class Dynamic extends Model {
  async createDynamic(content) {
    const dynamic = await Dynamic.create(content);

    return dynamic;
  }

  // 获取动态列表
  static async getDynamicList(query) {
    // 排序的方式
    let ranking = "created_at";
    if (query.type === "hot") {
      ranking = "likeNum";
    }

    const dynamic = await Dynamic.findAndCountAll({
      order: [[ranking, "DESC"]],
      limit: query.pageSize,
      offset: (query.pageIndex - 1) * query.pageSize,
      where: {
        theme: query.theme,
      },
    });

    return dynamic;
  }

  // 获取关注人动态列表
  static async getAttentionDynamic(uid) {
    const idols = await Fans.findAll({
      where: {
        followers: uid,
        isFollower: true,
      },
    });

    // 获取的动态
    const dynamics = [];
    for (let i = 0; i < idols.length; i++) {
      const dyns = await Dynamic.findAll({
        where: {
          author: idols[i].byFollowers,
        },
      });

      dynamics.push([...dyns]);
    }

    dynamics.sort(function (a, b) {
      return b.created_at - a.created_at;
    });

    return dynamics;
  }

  static async getFavDynamicList() {
    // 获取精选“动态”
    const dynamic = await Dynamic.findAll({
      order: [["likeNum", "DESC"]],
      limit: 3,
    });

    return dynamic;
  }
}

Dynamic.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    theme: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    likeNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    commNum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    picUrl: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "dynamic",
  }
);

module.exports = {
  Dynamic,
};
