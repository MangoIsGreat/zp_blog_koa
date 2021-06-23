/**
 * author: zp
 * description: “博客”点赞功能
 * date: 2021/6/23
 */
const Router = require("koa-router");
const { BLike } = require("../../models/blike");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const { BLikeValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/blike",
});

// 点赞动态
router.post("/like", new Auth().m, async (ctx, next) => {
  const v = await new BLikeValidator().validate(ctx);
  const content = {
    blog: v.get("body.blog"),
    user: ctx.auth.uid,
  };

  const result = await new BLike().likeBlog(content);

  if (!result) {
    throw new global.errs.ForbidOperate("您已经点过赞了！");

    return;
  }

  success();
});

module.exports = router;
