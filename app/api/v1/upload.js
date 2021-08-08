/**
 * author: zp
 * description: 文件上传模块
 * date: 2021/6/23
 */
const Router = require("koa-router");
const fse = require("fs-extra");
const { Auth } = require("../../../middlewares/auth");
const { UploadValidator } = require("../../validators/validator");
const { randomString } = require("../../lib/utils");
const path = require("path");
const router = new Router({
  prefix: "/v1",
});

// 上传文件
router.post("/upload", new Auth().m, async (ctx, next) => {
  const v = await new UploadValidator().validate(ctx);
  const { name, path: filePath } = ctx.request.files["file"];

  const fileName = randomString() + "." + name.split(".")[1];

  let dirName = "";
  if (v.get("body.type") === "article") {
    dirName = "../../../uploads/article";
  } else if (v.get("body.type") === "avatar") {
    dirName = "../../../uploads/avatar";
  } else if (v.get("body.type") === "circle") {
    dirName = "../../../uploads/circle";
  } else if (v.get("body.type") === "news") {
    dirName = "../../../uploads/news";
  }

  const dest = path.join(__dirname, dirName, fileName); // 目标目录，没有没有这个文件夹会自动创建
  await fse.move(filePath, dest); // 移动文件

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    url: "http://localhost:3001/" + fileName,
  };
});

module.exports = router;
