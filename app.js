const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://Shreyash:Shre4526@cluster0.nwda7hp.mongodb.net/ToDoListDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your ToDoList"
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "<--Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {

    Item.find({}).then(function (foundItems) {
        
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("Inserted default items!");
            }).catch(function (err) {
                console.log(err);
            });

            res.redirect("/");
        }
        else {
            res.render("list", {listTitle: "Today",
                                newListItems: foundItems
                               }
            );
        }

    }).catch(function (err) {
        console.log(err);
    });

});

app.get("/:listType", function (req, res){
    const listName = _.capitalize(req.params.listType);

    List.findOne({name: listName}).then(function (foundList){
        if(!foundList){
            //Create new List
            List.create({
                name: listName,
                items: defaultItems
            });
            res.redirect("/" + listName);
        }
        else{
            //Display the list
            res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items
            });
        }
    }).catch(function (err){
        console.log(err);
    });

});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.btn;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        Item.create(item);
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}).then(function (foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        }).catch(function (err){
            console.log(err);
        });
    }

});

app.post("/delete", function (req, res) {
    const checked_id = req.body.checkb;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.deleteOne({_id: checked_id}).then(function (){
            console.log("1 checked item deleted.");
            res.redirect("/");
        }).catch(function (err){
            console.log(err);
        });
    }
    else{
        List.updateOne({name: listName}, {$pull: {items: {_id: checked_id}}}).then(function (){
            res.redirect("/" + listName);
        }).catch(function (err){
            console.log(err);
        });
    }
    
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
