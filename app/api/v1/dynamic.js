const Router = require("koa-router");
const { Dynamic } = require("../../models/dynamic");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const { DynamicValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/dynamic",
});

// 创建动态
router.post("/create", new Auth().m, async (ctx, next) => {
  const v = await new DynamicValidator().validate(ctx);
  const content = {
    theme: v.get("body.theme") || "",
    content: v.get("body.content"),
    author: ctx.auth.uid,
  };

  await new Dynamic().createDynamic(content);

  success();
});

// 获取动态列表
router.get("/list", async (ctx, next) => {
  const dynamicList = await Dynamic.getDynamicList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: dynamicList,
  };
});

// 获取精选动态列表
router.get("/favlist", async (ctx, next) => {
  const dynamicList = await Dynamic.getFavDynamicList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: dynamicList,
  };
});

module.exports = router;
