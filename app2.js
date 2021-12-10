//Node modules
const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js");
const app=express();
const mongoose = require('mongoose');
var _=require("lodash");
var array = require('lodash/array');
var object = require('lodash/fp/object');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/Public"));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://admin-ivan:test123@cluster0.2p3sj.mongodb.net/todoListDB',{useNewUrlParser:true});
// mongoose schemas
const itemSchema= new mongoose.Schema({
  name: String
});
const listSchema= new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
//Mongoose models
const Item=mongoose.model("Item",itemSchema);
const List=mongoose.model("List",listSchema);

const item1=new Item({
  name:"usisati auto"
});
//item1.save();
const item2=new Item({
  name:"oprati veš"
});
//item2.save();
const item3=new Item({
  name:"obaviti trening"
});
//item3.save();
const standardItems=[item1,item2,item3];

//Home route
app.get("/",function(req,res){
  day=date.getDay();
    Item.find(function(err,items){
    if(items.length===0){
      Item.insertMany(standardItems,function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Succesfully added items!");
        }
      });
      res.redirect("/");
    } else{
      res.render("list2",{listTitle:day,newItem:items});
    }
  });
})


//Custom route
app.get("/:listName",function(req,res){
  let requestedTitle=_.capitalize(req.params.listName);

List.findOne({name:requestedTitle},function(err,foundList){
  if(!err){
    if(!foundList){
     //create a new list
     const list= new List({
       name:requestedTitle,
       items:standardItems
     });

 list.save();
res.redirect("/"+requestedTitle);


    } else{
      res.render("list2.ejs",{listTitle:foundList.name,newItem:foundList.items});
    }
}
  });
})


app.post("/",function(req,res){
  const newItem=req.body.newItem;
  const listName=req.body.list;
    const itemx= new Item({
    name:newItem
  }) ;
  if (listName===date.getDay()){
    itemx.save().then(console.log("Added item!"));
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemx);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

})
//Delete items
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName===date.getDay()){
    Item.deleteOne({_id:checkedItemId},function(err){
     if(err){console.log(err);}
      else{
        console.log("Deleted item");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){

        res.redirect("/"+listName);
      }
    });
  }


})

app.get("/about",function(req,res){
  res.render("about.ejs");
});

app.listen(process.env.PORT|| 3000 ,function(){
  console.log("server started on port 3000");
});
