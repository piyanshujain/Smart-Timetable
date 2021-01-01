var mongoose = require("mongoose");
const course = require("./course");
var slotSchema = new mongoose.Schema({
    day_name: String,
    date:String,
    time_name:String  
});

module.exports = mongoose.model("Slot", slotSchema);
