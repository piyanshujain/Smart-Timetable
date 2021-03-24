var mongoose = require("mongoose");
var courseSchema = new mongoose.Schema({
    c_name: String,
    c_code: String,
    Slot: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Slot"
         }
    ],
    Students:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
         }
    ]
});
module.exports = mongoose.model("Course", courseSchema);