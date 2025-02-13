const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const User = require("../models/user")
const jwt = require(
  "jsonwebtoken");
const Article = require("../models/article");
const multer = require("multer");
const Contact = require("../models/contact");
const authUser = require("../middleware/authUser");

//define storage for the images
const storage = multer.diskStorage({
  // destionation for files 
  destination:function (req,file,cb) {
    cb(null,"./src/upload")
  },

  //add back the extension
  filename:function (req,file,cb){
    cb(null,Date.now()+file.originalname)
  },
});


//upload parameters for multer
const upload = multer({
  storage:storage,
  limits:{
    fileSize:1024 * 1024 * 5
  }
})





router.get("/local", async (req, res) => {
  let success = false;
  let isAdmin = false;
  let articles = false;
  let admin;
  let user;
  let name;
  let login = false;
  try {
    if(req.cookies.jwt){
      console.log("inside");
      const token = req.cookies.jwt;
      if(token) login = true;
      const _id = jwt.verify(token, process.env.PRIVATE_KEY);
      console.log(_id);
      admin = await Admin.findOne({_id});
      user = await User.findOne({_id});
      if(user){
        name = user.name;
      }else{
        name = admin.name
        isAdmin = true
      }
      // console.log("my admin ",admin.name);
      // if(admin) {
      // }
    }
  // articles = [
    
  //   {
  //     title: "my title",
  //     description: "my description",
  //     urlToImage: "../../images/img1.jpg",
  //   },
  //   {
  //     title: "my title",
  //     description: "my description",
  //     urlToImage: "../../images/img2.jpg",
  //   },
  //   {
  //     title: "my title",
  //     description: "my description",
  //     urlToImage: "../../images/img3.jpg",
  //   },
  //   {
  //     title: "my title",
  //     description: "my description",
  //     urlToImage: "../../images/img3.jpg",
  //   },
  //   {
  //     title: "my title",
  //     description: "my description",
  //     urlToImage: "../../images/img3.jpg",
  //   },
  //   {
  //     title: "my title",
  //     description: "my description",
  //     urlToImage: "../../images/img3.jpg",
  //   },
  // ];
  
  articles = await Article.find().sort({ createdAt: "desc" })
  if(articles.length===0) articles = false;
  console.log(articles);
  res.render("localArticles/articles", { articles: articles,admin:isAdmin,name:name,login:login });
} catch (error) {
    res.status(500).json({success,error:error.message})  
}
});


router.get("/local/new",async (req, res) => {
  let isAdmin = false;
  let admin = false;
  try {
    if(req.cookies.jwt){
      console.log("inside");
      const token = req.cookies.jwt;
      const _id = jwt.verify(token, process.env.PRIVATE_KEY);
      console.log(_id);
      admin = await Admin.findOne({_id});
      console.log("my admin ",admin.name);
      if(admin) {
        isAdmin = true
      }
    }
  res.render("localArticles/new", { article: new Article(),admin:isAdmin });
} catch (error) {
  res.status(500).json({success,error:error.message})
}
})

router.post("/", upload.single("urlToImage") , async (req,res)=>{
  console.log(req.file);
  let article = new Article({
    title: req.body.title,
    description: req.body.description,
    // urlToImage: req.body.urlToImage,
    urlToImage: req.file.filename,

})
try {
    article = await article.save();
    res.redirect(`/admin/category/local`);
} catch (e) {
    console.log(e);
    res.render("localArticles/new", { article: article });
}
})

router.put("/edit/:id", upload.single("urlToImage") ,async (req,res)=>{
  console.log(req.file);
  try {
    let article = await Article.findById(req.params.id);
    article.title = req.body.title;
    article.description = req.body.description;
    article.urlToImage = req.file.filename;

    article = await article.save();
    res.redirect("/admin/category/local");
  } catch (error) {
      console.log(error);
  }
})
router.get("/feedback",async (req,res)=>{
  const article = await Contact.find().sort({ createdAt: "desc" });
  res.render("localArticles/feedback",{articles:article});
  // res.json(article);
})

router.get("/edit/:id",async(req,res)=>{
  const article = await Article.findById(req.params.id);
  res.render("localArticles/edit",{ article: article,admin:true });
})
router.delete("/delete/:id", async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.redirect("/admin/category/local");
})

module.exports = router; 
 