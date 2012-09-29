function create(){

var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, Article = require('./article').Article
	, User = require('./user').User

var CommentSchema = new Schema({
	content : { type: String, require: true },
	authorId: { type: String, require: true },
	articelId: { type: Schema.ObjectId, ref:'Article'},
	commentId: { type: Schema.ObjectId },
	createTime: { type: Date, default: Date.now() },
	email: { type: String, lowercase: true, match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/ }

});

return mongoose.model('Comment', CommentSchema);
}

exports.Comment = create;