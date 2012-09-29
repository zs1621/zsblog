function create(){
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user').User;
var Arctile = require('./article').Article;


var CategorySchema = new Schema({
	content: { type: String, require: true, default: '默认分类'},
	article:[{type: Schema.Types.ObjectId, ref:'Article'}],
	userId: { type: Schema.Types.ObjectId, ref:'User'},
	createTime: { type: Date, default: Date.now()},
	
});

return mongoose.model('Category', CategorySchema);
}
exports.Category = create;