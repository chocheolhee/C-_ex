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

// router.use("/shirts", 로그인했니); // localhost~~/shop/shirts에 접속했을 때만 로그인했니 미들웨어 적용

router.get("/shirts", function (요청, 응답) {
    응답.send("셔츠 파는 페이지입니다.");
});

router.get("/pants", function (요청, 응답) {
    응답.send("바지 파는 페이지입니다.");
});

module.exports = router;
