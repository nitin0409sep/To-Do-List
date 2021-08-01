//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin@cluster0.pimdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true });

// const { MongoClient } = require('mongodb');
// const uri = "";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


const itemsSchema = {
  summary: String,
  description: String
};


// schema bna rhe h items (plural form)
const Item = mongoose.model("item", itemsSchema);


var current_date = Date();
// 2021-07-30 20:43:11



// adding default doc to model items
const item1 = new Item({
  summary: "Welcome to your todolist!",
  description: "Hello My name is nitin"
});

const item2 = new Item({
  summary: "Hit the + button to add a new item.",
  description: "Hello"
});

const item3 = new Item({
  summary: "Hit this to delete an item.",
  description: "Hello"
});


const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

});


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });



});

app.post("/", function (req, res) {
  
  const itemSummary = req.body.summary;
  const itemDescription = req.body.description;
  const buttonValue = req.body.cancel;

  

  console.log(buttonValue)
  if (buttonValue || itemSummary=="") {
    res.redirect("/");
  } else {
    const item = new Item({
      summary: itemSummary,
      description: itemDescription
    });

    item.save();
    res.redirect("/");
  }
  // if (listName === "Today"){
  //   item.save();
  //   res.redirect("/");
  // } else {
  //   List.findOne({name: listName}, function(err, foundList){
  //     foundList.items.push(item);
  //     foundList.save();
  //     res.redirect("/" + listName);
  //   });
  // }
});


app.post("/delete", function (req, res) {
  const checkedItemId = req.body.submit ;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.Port;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started Successfully.");
});
