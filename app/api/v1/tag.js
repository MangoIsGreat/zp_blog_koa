/**
 * author: zp
 * description: 分类标签
 * date: 2021/7/26
 */
const Router = require("koa-router");
const { Tag } = require("../../models/tag");
const router = new Router({
  prefix: "/v1/tag",
});

// 获取分类标签
router.get("/list", async (ctx, next) => {
  const data = await Tag.getTagList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

module.exports = router;
