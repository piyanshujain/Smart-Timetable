var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    uid: String,
    roll_num : String,
    role: String,
    email: String,
    branch : String,
    Courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
         }
    ]

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
