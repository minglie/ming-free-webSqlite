M=require("ming_node");
M.log_path="M.log";

var SQLite3 = require('sqlite3').verbose();
var Db = new SQLite3.Database("./student.db");

Db.display_sql_enable=false;
Db.doSql=function doSql(sql){
    var promise = new Promise(function(reslove,reject){
        if(Db.display_sql_enable) M.log(sql+";")
        if(sql.indexOf("select")>-1){
            Db.all(sql,
                function(err, result) {
                    if (err) {
                        M.log(err);
                        reject(err);
                    } else {
                        reslove(result);
                    }
                });
        }else{
            Db.run(sql,
                function(err) {
                    if(err){
                       // M.log(err);
                        reject(err);
                    }
                    reslove(null);
                });
        }
    })
    return promise;
}



var app=M.server();
app.listen(8888);
M.log_console_enable=false;//将日志输出到控制台


app.get("/",async function (req,res) {
    app.redirect("/index.html",req,res);
});

app.post("/doSql",async function (req,res) {
    M.log(req.params.sql);
    try{
        let sqlist=req.params.sql.split(";")
        if(sqlist.length>2){
            for (let i=0;i<sqlist.length-1;i++){
                await Db.doSql(sqlist[i]);
            }
            res.send(M.result("ok"));
        }else {
            var rows= await Db.doSql(req.params.sql);
            res.send(M.result(rows));
        }

    }catch (e){
        res.send(M.result(e,false));
    }

})


