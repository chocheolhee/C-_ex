const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");
const methodoverride = require("method-override");
app.use(methodoverride("_method"));
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
require("dotenv").config(); // 환경변수 사용

//미들웨어
app.use("/public", express.static("public"));
app.use(session({ secret: "비밀코드", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
    if (err) return console.log(err);
    db = client.db("todoapp");

    // db.collection("post").insertOne({ 이름: "Cho", _id: 100 }, function (에러, 결과) {
    //     console.log("저장완료");
    // });

    app.listen(process.env.PORT, function () {
        console.log("listening on 8080");
    });
});

// app.get("/beauty", function (req, res) {
//     res.send("뷰티용품사세요");
// });

//Router 기능개발
app.use("/shop", require("./routes/shop.js"));

app.use("/board/sub", require("./routes/board.js"));

// app.get('/board/sub/sports', function(요청, 응답){
//     응답.send('스포츠 게시판');
//  });

//  app.get('/board/sub/game', function(요청, 응답){
//     응답.send('게임 게시판');
//  });

app.get("/", function (req, res) {
    res.render("index.ejs");
});
app.get("/write", function (req, res) {
    res.render("write.ejs");
});

app.post("/add", function (req, res) {
    // res.send("전송완료");
    console.log(req.body);
    db.collection("counter").findOne({ name: "게시물갯수" }, function (err, result) {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
        var 저장할거 = { _id: 총게시물갯수 + 1, 작성자: req.user._id, 제목: req.body.title, 날짜: req.body.date };

        db.collection("post").insertOne(저장할거, function (에러, 결과) {
            console.log("저장완료");
            // counter라는 콜렉션에 있는 totalPost 라는 항목도 1 증가시켜야 함
            db.collection("counter").updateOne({ name: "게시물갯수" }, { $inc: { totalPost: 1 } }, function (err, result) {
                if (err) {
                    return console.log(err);
                }
            });
            res.redirect("/list");
        });
    });
});

app.get("/list", function (req, res) {
    db.collection("post")
        .find()
        .toArray(function (err, result) {
            console.log(result);
            res.render("list.ejs", { posts: result });
        });
});

// 검색기능 기능개발
app.get("/search", (req, res) => {
    var 검색조건 = [
        {
            $search: {
                index: "titleSearch",
                text: {
                    query: req.query.value,
                    path: "제목", // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                },
            },
        },
        // 검색결과 필터
        { $sort: { _id: 1 } },
        { $project: { 제목: 1, 날짜: 1, _id: 1, score: { $meta: "searchScore" } } },
    ];
    db.collection("post")
        .aggregate(검색조건)
        .toArray((err, result) => {
            console.log(result);
            res.render("search.ejs", { posts: result });
        });
});

//ajax로 data : { _id : e.target.dataset.id}로 보냈기 때문에 server.js deletOne(req.body)에
// 쿼리문이 들어간다
app.delete("/delete", function (req, res) {
    console.log(req.body); // data : { _id : "1"}이라는 데이터가 넘어온다. (req.body. + (지금보낸 data)_id ) = "1"
    req.body._id = parseInt(req.body._id); // 여기서 req.body._id ="1" 인 값을 숫자 1로 변환해줘야 DB에서 삭제가 가능해진다
    var 삭제할데이터 = { _id: req.body._id, 작성자: req.user._id };
    db.collection("post").deleteOne(삭제할데이터, function (err, result) {
        if (result) {
            console.log(result);
        }
        console.log("삭제완료");
        res.status(200).send({ message: "성공했습니다" });
    });
});

app.get("/detail/:id", function (req, res) {
    db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render("detail.ejs", { data: result });
    });
});

app.get("/edit/:id", function (req, res) {
    db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render("edit.ejs", { post: result });
    });
});

app.put("/edit", function (req, res) {
    db.collection("post").updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, result) {
        console.log("수정완료");
        res.redirect("/list");
    });
});

app.get("/login", function (req, res) {
    res.render("login.ejs");
});

app.get("/fail", function (req, res) {
    res.send("로그인 실패");
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/fail",
    }),
    function (req, res) {
        res.redirect("/");
    }
);

app.get("/mypage", 로그인했니, function (req, res) {
    console.log("req.user");
    res.render("mypage.ejs", { 사용자: req.user });
});

function 로그인했니(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send("로그인 해주세요");
    }
}

passport.use(
    new LocalStrategy(
        {
            usernameField: "id",
            passwordField: "pw",
            session: true,
            passReqToCallback: false,
        },
        function (입력한아이디, 입력한비번, done) {
            //console.log(입력한아이디, 입력한비번);
            db.collection("login").findOne({ id: 입력한아이디 }, function (에러, 결과) {
                if (에러) return done(에러);
                // 중요한 부분
                if (!결과) return done(null, false, { message: "존재하지않는 아이디요" }); // done(서버에러, 성공시 사용자 DB데이터, { 에러메세지 넣는 부분})
                if (입력한비번 == 결과.pw) {
                    return done(null, 결과);
                } else {
                    return done(null, false, { message: "비번틀렸어요" });
                }
            });
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (아이디, done) {
    db.collection("login").findOne({ id: 아이디 }, function (err, result) {
        done(null, result);
    });
});

app.post("/register", function (req, res) {
    db.collection("login").insertOne({ id: req.body.id, pw: req.body.pw }, function (err, result) {
        res.redirect("/");
    });
});
