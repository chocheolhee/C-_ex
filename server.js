const express = require("express");
const req = require("express/lib/request");
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

var db;
MongoClient.connect("mongodb+srv://admin:qwer1234@cluster0.ry1xo.mongodb.net/todoapp?retryWrites=true&w=majority", { useUnifiedTopology: true }, function (err, client) {
    if (err) return console.log(err);
    db = client.db("todoapp");

    // db.collection("post").insertOne({ 이름: "Cho", _id: 100 }, function (에러, 결과) {
    //     console.log("저장완료");
    // });

    app.listen(8080, function () {
        console.log("listening on 8080");
    });
});

// app.get("/beauty", function (req, res) {
//     res.send("뷰티용품사세요");
// });

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get("/write", function (req, res) {
    res.sendFile(__dirname + "/write.html");
});

app.post("/add", function (req, res) {
    // res.send("전송완료");
    console.log(req.body);
    db.collection("counter").findOne({ name: "게시물갯수" }, function (err, result) {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;

        db.collection("post").insertOne({ _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date }, function (에러, 결과) {
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

app.delete("/delete", function (req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection("post").deleteOne(req.body, function (err, result) {
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
