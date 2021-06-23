/**
 * author: zp
 * description: “动态”点赞功能
 * date: 2021/6/23
 */
const Router = require("koa-router");
const { DLike } = require("../../models/dlike");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const { DLikeValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/dlike",
});

// 点赞动态
router.post("/like", new Auth().m, async (ctx, next) => {
  const v = await new DLikeValidator().validate(ctx);
  const content = {
    dynamic: v.get("body.dynamic"),
    user: ctx.auth.uid,
  };

  const result = await new DLike().likeDynamic(content);

  if (!result) {
    throw new global.errs.ForbidOperate("您已经点过赞了！");

    return;
  }

  success();
});

module.exports = router;
