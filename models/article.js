function create(){
var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, User = require('./user').User
	, Category = require('./category').Category
	, Tag = require('./tag').Tag
	, Comment = require('./comment').Comment;

		

var ArticleSchema = new Schema({
	authorId: { type: Schema.ObjectId, required: true, index: true, ref:'User'},
	content: String,
	title: { type: String, required: true, index: true},
	publishtime: { type: Date, required: true },
	hidden:{ type: Boolean, default: false}, 
	visitCount: { type: Number, default:0},
	commentCount: { type: Number, default: 0},
	lastModified: { type: String, required: true, default: Date.now },
	comment: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
	category: { type: Schema.Types.ObjectId, required: true, ref: 'Category'},
	tag: [{ type: Schema.Types.ObjectId, ref: 'Tag'}]
});



return mongoose.model('Article', ArticleSchema);
}
exports.Article = create;
