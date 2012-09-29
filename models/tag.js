
function create(){
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Article = require('./article').Article;

var TagSchema = new Schema({
	name: {type: String, require: true},
	clickCount: {type: Number, default: 0},
	article:[{type: Schema.Types.ObjectId, ref:'Article'}]
});

return  mongoose.model('Tag', TagSchema);
}

exports.Tag = create;