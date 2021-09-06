const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

class Tag extends Model {
  static async getTagList() {
    const tags = await Tag.findAndCountAll({
      order: [["tag_type", "ASC"]],
      attributes: ["id", "tag_type", "tag_name"],
    });

    return tags;
  }

  static async createTag(type, name) {
    return Tag.create({
      tagType: type,
      tagName: name,
    });
  }
}

Tag.init(
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
    tagType: {
      type: Sequelize.INTEGER,
    },
    tagName: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    tableName: "tag",
  }
);

module.exports = {
  Tag,
};
