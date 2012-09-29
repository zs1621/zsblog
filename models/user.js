

function create(){
var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, Article = require('./article').Article
	, Comment = require('./user').Comment
	, crypto = require('crypto');
	

var UserSchema = new Schema({
	name: { type: String, index: true, required: true},
	password: { type: String, required: true},
	created: { type: Date, required: true, default: Date.now()},
	email:{type: String, required:true},
	active:{type: Boolean, default: false},
	is_admin:{type: Boolean, default: false},
	arcticle: [ {type: Schema.ObjectId, ref: 'Arctile'} ],
	comment: [ {type: Schema.ObjectId, ref: 'Comment'} ],
	active_key: String
});
	

return mongoose.model('User', UserSchema);
}

exports.User = create;