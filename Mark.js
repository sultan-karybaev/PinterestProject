var mongoose = require("mongoose");
var Mark = mongoose.Schema({
    title: String,
    text: String,
    images: Number,
    imagegridstyle: Number,
    admin: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
}, { versionKey: false });

module.exports = mongoose.model("Mark", Mark);