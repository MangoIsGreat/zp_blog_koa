/**
 * author: zp
 * description: "动态"分类标签
 * date: 2021/8/2
 */
const Router = require("koa-router");
const { Theme } = require("../../models/theme");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/theme",
});

// 创建动态分类标签
router.post("/create", new Auth().m, async (ctx, next) => {
  const data = await Theme.createTheme({
    themeName: ctx.request.query.name,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

// 获取动态分类标签列表
router.get("/list", async (ctx, next) => {
  const data = await Theme.getThemeList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

module.exports = router;
