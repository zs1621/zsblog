var Article = require('../models/article').Article();
var Category= require('../models/category').Category();
var Tag = require('../models/tag').Tag();
//var Comment = require('../models').Comment;



exports.operate = function(req, res, next){
	if(!req.session.user) return res.redirect('/login');
	var method = req.method.toLowerCase();
	if(method == "get"){
		res.render('article/operate_article',{
			layout: 'zlayout',
			user: req.session.user
		})
	}
	if(method == "post"){
		if(req.body.opr){
	
			var opr = req.body.opr;
		}
		
		
		if(req.body.opt){
			var opt = req.body.opt;
		}
		var id;
		if(req.body.id){
			id = req.body.id;
		}
		if( opt && opt == "get_category" ){
			Category.find({userId: req.session.user._id}).sort('-createTime').exec(function(err,categories){
				if(err) return next(err);
				console.log()
				res.end(JSON.stringify(categories));
			});
		}
		if( opr && opr == "get_all_articles"){
			Article.find({authorId: req.session.user._id}).sort('-publishtime').exec(function(err, articles){
				if(err) return next(err);
				res.end(JSON.stringify(articles));
			});
		}
		if(  opr && opr == "get_articles" && id){
			Category.findOne({_id: id}).populate('article').exec(function(err, category){
				if(err) return next(err);
				res.end(JSON.stringify(category.article));		
			})
		}
	}
}




		// for(var i=0;i<category.article.length;i++){
		// 			Article.find({_id: category.article[i]})
		// 						 .sort('-publishtime')
		// 						 .exec(function(err,articles){
		// 						 	if(err) return next(err);
		// 						 	res.end(JSON.stringify(articles));
		// 						 });
		// 		}