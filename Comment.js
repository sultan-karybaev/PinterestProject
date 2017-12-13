var mongoose = require("mongoose");
var Comment = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    mark: {type: mongoose.Schema.Types.ObjectId, ref: "Mark"},
    text: String
}, { versionKey: false });

module.exports = mongoose.model("Comment", Comment);