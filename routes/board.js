var router = require("express").Router();

// 로그인 관련 미들웨어 적용
function 로그인했니(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send("로그인 해주세요");
    }
}

router.use(로그인했니); // 로그인 후 가능한 미들웨어

router.get("/sports", function (요청, 응답) {
    응답.send("스포츠 게시판");
});

router.get("/game", function (요청, 응답) {
    응답.send("게임 게시판");
});

module.exports = router;
