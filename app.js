//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_CONNECT);

const itemsSchema = {
  title : {type : String, required : true},
  blog : {type : String, required : true}
}

const bookSchema = {
  name : {type : String, required : true},
  email : {type : String, required : true},
  phone : {type : Number, required : true},
  date : {type : Date, required : true},
  service : {type : String, required : true}
}

const Post = mongoose.model("Post", itemsSchema);

const Book = mongoose.model("Book", bookSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/packages", function(req, res){
  res.render("packages");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/blog", function(req, res){
    res.render("blog");
});

app.get("/book", function(req, res){
  res.render("book");
});

app.post("/book", function(req, res){
    const addBook = new Book({
      name : req.body.name,
      email : req.body.email,
      phone: req.body.phone,
      date : req.body.date,
      service : req.body.service
    });
    addBook.save();
    res.redirect("/");
});


app.post("/compose", function(req, res){

   const addPost = new Post({
    title: req.body.postTitle,
    blog : req.body.postBody
  });

  addPost.save();
  res.redirect("/");

});

app.get("/posts/:id", function(req, res){

  const requestedTitleID = _.lowerCase(req.params.id);

    Post.find({})
    .then((foundItems, error) =>{
      foundItems.forEach((element) =>{
        const storedID = _.lowerCase(element._id)
        if(storedID === requestedTitleID){
          res.render("post", {title : element.title, content : element.blog})
        }
      })

    }).catch(() =>{
      console.log(error)
    })

});

app.post("/sign-up", function(req, res){

  const firstName = req.body.first;
  const secondName = req.body.second;
  const email =  req.body.email;

  const data ={
   members: [
       {
           email_address: email,
           status: "subscribed",
           merge_fields: {
               FNAME: firstName,
               LNAME: secondName
           }
       }
   ]
  };


  const jsonData = JSON.stringify(data);

  const url = "https://us22.api.mailchimp.com/3.0/lists/37f034d239";

  const option = {
   method: "POST",
   auth: process.env.MAILCHIMP_API

  }

  const request = https.request(url, option, function(response){

       response.on("data", function(data){
           if(response.statusCode === 200){

               res.write("Successful added to newsletter mailing list");
       
           }else{
               res.write("Process failed try again");
           }
           res.send();
       });

    });
   
  request.write(jsonData);
  request.end();

});

app.listen(10000, function() {
  console.log("Server started on port 10000");
});
