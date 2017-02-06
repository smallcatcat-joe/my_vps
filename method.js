/**
*   用于分离请求方式
*
* */
const path = require('path'),
      fs = require('fs');

const crypto = require("crypto");

const account = require('./charming_account/account'),
      get_img = require('./charming_get_img/get_img');


//判断是否直接访问域名
let isHomepage = (req) => req.pathname.slice(-1) === '/';

//返回Content-Type
let rtnContType = (type) => {
    switch(type){
        case "html":
            type = "text/html";
            break;
        case "css":
            type = "text/css";
            break;
        case "js":
            type = "application/x-javascript";
            break;
        case "jpg":
            type = "image/jpeg";
            break;
        case "png":
            type = "image/png";
            break;
        case "gif":
            type = "image/gif";
            break;
        case "ico":
            type = "image/x-icon";
            break;
        default:
            throw new Error("Please add fileExt");
    }
    return type;
};

//返回相应文件到client
let rtnFile = (req,res,ext) => {
    let pathname = req.pathname;
    let filePath = path.join(process.cwd(),pathname);
    let type = ext ? ext.slice(1) : "unknow";

    type = rtnContType(type);

    let existsPath = () => {
        fs.exists(filePath,function (exists) {
            if (!exists){
                it.throw(new Error("don't has file!"));
            }
            else {
                it.next("exists");
            }
        });
    };

    let readFile = () => {
        fs.readFile(filePath,"binary",function (err,file) {
            if (err){
                it.throw(err);
                res.writeHead(500,{
                    "Content-Type":"text/plain"
                });
                res.end(err.toString());
            }
            else {
                res.writeHead(200,{
                    "Content-Type":type
                });
                res.end(file,"binary");
            }
        })
    };

    /*
    *   生成器函数(用于控制异步流程)
    *   1、查看文件路径是否存在
    *   2、读取文件路径的文件并返回到client
    */
    function *gen() {
        try {
            //是否存在文件路径
            yield existsPath();
            //读取文件
            yield readFile();
        }
        catch(err) {
            console.log(err);
        }
    }

    //启动生成器
    let it = gen();
    //初始执行
    it.next();
};

//以get方式请求
exports.getData = (req,res) => {
    let pathname = req.pathname;

    //文件尾缀
    let ext = path.extname(pathname);

    // //访问域名
    // if (isHomepage(req)){
    //     req.pathname += 'index.html';
    //     //更新ext以便返回相应文件
    //     ext = path.extname(req.pathname);
    //     console.log(ext);
    //     rtnFile(req,res,ext);
    // }
    // else {
    //     if (ext) {
    //         //访问指定路径文件
    //         rtnFile(req,res,ext);
    //     }
    // }

    //判断是否有ext、有则返回相应尾缀的文件
    if (ext) {
        //访问指定路径文件
        rtnFile(req,res,ext);
    }
    else {
        //判断是否直接访问ip或域名、不是则进入相应方法
        if (isHomepage(req)){
            req.pathname += 'index.html';
            //更新ext以便返回相应文件
            ext = path.extname(req.pathname);
            rtnFile(req,res,ext);
        }
        else {
            //获取主页图片路径
            if (/\/homepage_img$/.test(pathname)){
                get_img.get_homepage(req,res);
            }
        }
    }



};

//以post方式请求
exports.postData = (req,res) => {
    let pathname = req.pathname;

    //注册
    if (/\/register$/.test(pathname)){
        account.register(req,res);
    }

    //登陆
    if (/\/login$/.test(pathname)){
        account.login(req,res);
    }

    //session状态登录
    if (/\/session$/.test(pathname)){
        account.session_login(req,res);
    }

    //session删除
    if (/\/session_del$/.test(pathname)){
        account.session_del(req,res);
    }
};