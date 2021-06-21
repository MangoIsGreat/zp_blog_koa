const Sequelize = require("sequelize");
const { dbName, host, port, user, password } =
  require("../config/config").database;

const sequelize = new Sequelize(dbName, user, password, {
  dialect: "mysql",
  host,
  port,
  logging: false,
  timezone: "+08:00",
  define: {
    timestamps: true,
    paranoid: true, // 软删除
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    underscored: true,
  },
});

sequelize.sync({
  force: false, // 配置修改则删除表重新创建
});

module.exports = {
  sequelize,
};
