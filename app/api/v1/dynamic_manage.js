const Router = require("koa-router");
const { Dynamic } = require("../../models/dynamic");
const { Auth } = require("../../../middlewares/auth");
const { DcommentListValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/admin/dynamic",
});

// 获取动态列表
router.get("/list", new Auth().m, async (ctx, next) => {
  const dynamicList = await Dynamic.getAllDynamicList(ctx.request.query);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: dynamicList,
  };
});

// 删除某一条动态
router.post("/delete", new Auth().m, async (ctx, next) => {
  const v = await new DcommentListValidator().validate(ctx);

  const result = await Dynamic.deleteAdminDyn(v.get("body.dynamicId"));

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取某一条动态
router.get("/one", new Auth().m, async (ctx, next) => {
  const dynamicList = await Dynamic.getOneDynamic(ctx.request.query);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: dynamicList,
  };
});

// 更新某一条动态
router.post("/update", new Auth().m, async (ctx, next) => {
  const result = await Dynamic.updateDyn(ctx.request.body);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
