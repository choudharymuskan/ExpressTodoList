const express = require('express');
const app = express();

const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash')
// var items=["Buy Food" , "Cook Food"];
// let workItems = [];
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static("static"));
mongoose.connect("mongodb+srv://Admin-muskan141001:muskan141001@cluster0.xisc9.mongodb.net/todolistDB", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to todolist"
})
const item2 = new Item({
    name: "Hit the  + button to add items "
})
const item3 = new Item({
    name: "Delete the item if task is coompleted"
})

const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema)

app.get('/', (req, res) => {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items to DB")
                }
            });
            res.redirect("/");
        }
        res.render('list', { listTitle: "Today", newListItems: foundItems });
    });
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    //  const List =  mongoose.model("List", listSchema);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }else {
        res.render('list', { listTitle: foundList.name, newListItems: foundList.items })
    }
}
});
});


app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName

    });
    if(listName === "Today"){
    item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, foundList)
        {
            foundList.items.push(item);
         foundList.save();
    res.redirect("/" + listName ) ;
});
    }
});


app.get("/about", function (req, res) {
    res.render("about")
})



app.post("/delete", function (req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName  === "Today")
    {
        Item.findByIdAndRemove(checkItemId, function (err) {
            if (!err) {
                console.log("Sucessfully Delelted")
            }
        })
        res.redirect("/");
    
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkItemId}}}, function(err, foundList)
        {
            if(!err){
               res.redirect("/" + listName); 
            }
        })
    }
   
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log(`App listening at http://localhost:${port}`)
});

