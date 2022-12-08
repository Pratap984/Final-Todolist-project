const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app= express();
//var items=["Buy Food","Cook Food","Eat Food"];
var workItems=[];
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Set up default mongoose connection
const mongoDB = "mongodb+srv://admin-prathap:Prathap984@cluster0.nklg3ut.mongodb.net/todolistDB";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const task1 = new Item ({
  name:"Welcome to your todolist!"
});

const task2 = new Item ({
  name:"Click the + button to add a new task"
});

const task3 = new Item ({
  name:"Click check box to delete a task"
});

const defaultItems = [task1,task2,task3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
  Item.find({},function(err,foundItems){
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems,function(err) {
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("Succesfully Inserted");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today",newEntrys: foundItems});
    }
  });
  // var today = new Date();
  //
  // var options = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // };
  // var day= today.toLocaleString("en-US", options);

});

app.get("/:customListName", function(req,res){
const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
  if(!err)
  {
    if(!foundList)
    {
      //create New
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName);
    }
    else{
      //show existiing List
      res.render("List",{listTitle: foundList.name,newEntrys: foundList.items});
    }
  }
})

});

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  //console.log(listName);

  const task4 = new Item({
    name:itemName
  });

  if(listName === "Today"){
    task4.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err,foundList){
      if(err)
      {console.log(err);}
      else{
    foundList.items.push(task4);
    foundList.save();
    res.redirect("/" + listName);}
  })
  }
})

app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){

      if(err){
        console.log(err);
      }
      else{
        console.log("successfully deleted");
        res.redirect("/");
      }

  });
}

else{
  List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
  if(!err){
    res.redirect("/" + listName);
  }
})
}

})




// app.get("/work",function(req,res)
// {s
//
//   res.render("list",{listTitle:"Work List",newEntrys:workItems});
// });

app.get("/aboutme",function(req,res)
{
  res.render("aboutme");
});
app.listen(3000, function(){
  console.log("Sever started at port 3000");
});
