const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");
const { User } = require("./user");

class Fans extends Model {
  static async follow(content) {
    const data = await Fans.findOne({
      where: { byFollowers: content.byFollowers, followers: content.followers },
    });

    // 被关注者
    const byUser = await User.findOne({
      where: {
        id: content.byFollowers,
      },
    });

    // 关注者
    const user = await User.findOne({
      where: {
        id: content.followers,
      },
    });

    // 关注记录存在&已关注
    if (data && data.isFollower) {
      // 已关注，关注者关注人数量-1
      await user.decrement("idolNum", { by: 1 });
      // 已关注，被关注者粉丝数量-1
      await byUser.decrement("fansNum", { by: 1 });

      await Fans.update(
        { isFollower: false },
        {
          where: {
            byFollowers: content.byFollowers,
            followers: content.followers,
          },
        }
      );

      return "cancel";
    }

    // 关注记录存在&未关注
    if (data && !data.isFollower) {
      // 未关注，关注者关注人数量+1
      await user.increment("idolNum", { by: 1 });
      // 未关注，被关注者粉丝数量+1
      await byUser.increment("fansNum", { by: 1 });

      await Fans.update(
        { isFollower: true },
        {
          where: {
            followers: content.followers,
            byFollowers: content.byFollowers,
          },
        }
      );

      return "ok";
    }

    // 未点过赞
    if (!data) {
      // 未关注，关注者关注人数量+1
      await user.increment("idolNum", { by: 1 });
      // 未关注，被关注者粉丝数量+1
      await byUser.increment("fansNum", { by: 1 });

      await Fans.create({
        byFollowers: content.byFollowers,
        followers: content.followers,
        isFollower: true,
      });

      return "ok";
    }

    return false;
  }
}

Fans.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    byFollowers: {
      type: Sequelize.STRING,
    },
    followers: {
      type: Sequelize.STRING,
    },
    isFollower: {
      type: Sequelize.BOOLEAN,
    },
  },
  {
    sequelize,
    tableName: "fans",
  }
);

module.exports = {
  Fans,
};
