var Article = require('../models/article').Article();
var Category = require('../models/category').Category();
var Tag = require('../models/tag').Tag();
var Showdown = require('../public/js/showdown');
//var Util = require('../libs/util');
function article_tran(a_array){
	for(var i = 0; i < a_array.length; i++){
		a_array[i].content = Showdown.parse(a_array[i].content);
		var num = a_array[i].content.indexOf('--more--');
		a_array[i].content = a_array[i].content.slice(a_array[i].content, num);
		a_array[i].content = a_array[i].content.concat("......");
	}
}

// exports.search = function(req, res, next){
// 	var req.

// }
exports.index = function(req, res, next){
	var page = parseInt(req.query.page, 10) || 1;
	var keyword = req.query.q || '';
	var limit = 5;
	var user = req.session.user;

	if(Array.isArray(keyword)){
		keyword = keyword.join(' ');
	}
	keyword = keyword.trim();
	console.log(keyword);
	req.session.keyword = keyword;
	var query = {};
	if(keyword){
		keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g,'');
		query ={$or:[{title: new RegExp(keyword,'i')},{content: new RegExp(keyword,'i')}]};
	}

	Article
				.find(query)
				.populate('tag')
				.limit(limit)
				.skip((page-1)*limit)
				.sort('-publishtime')
				.exec(function(err, articles){
					if(err) return next(err);
					var article = articles;
					article_tran(article);
					Tag.find().sort('-clickCount').exec(function(err,alltags){
						if(err) return next(err);
						Article.count({}, function(err, count){
							if(err) return next(err);
							var pages = Math.ceil(count/limit);
							Category.find({}, function(err, category){
								if(err) return next(err);
								var category = category;
								res.render('index',{
									layout: 'layout',									
									tags: alltags,
									article: article,
									base: '/',
									current_page: page,
									pages: pages,
									category: category,
									user: user,
									keyword: keyword,
								});
							});
						});							
					});
				});	
}


exports.article = function(req, res, next){
	var title = req.params.title;
	if(req.session.user){
		var user = req.session.user;
	}
	Article
				.findOne({title: title})
				.populate('tag')
				.exec(function(err, articles){
					if(err) return next(err);
					articles.visitCount = articles.visitCount + 1  ;
					articles.save(function(err){
						if(err) return next(err);
					});
					var content = articles.content;
					content =  Showdown.parse(content);
					var continue_locate = content.indexOf("--more--");
					content = content.replace('--more--','');
					Tag.find({}, function(err, all_tags){
						if(err) return next(err);
						Category.find({}, function(err, category){
							if(err) return next(err);
							res.render('site/article/article',{
							layout: 'layout',
							article: articles,
							content: content,
							tags: all_tags,
							category: category,
							title:title,
							user: user,
							});
						});
					});				
				});
}

exports.category = function(req, res, next){

	var page = parseInt(req.query.page, 10) || 1;
	var id = req.params.id;
	var limit = 5;
	Article
				.find({category: id})
				.populate('tag')
				.limit(limit)
				.skip((page-1)*limit)
				.sort('-publishtime')
				.exec(function(err,article){
					if(err) return next(err);
					var articles = article;
					if(articles.length > 0){						
						article_tran(articles);
					}
					Tag.find({},function(err, all_tags){
						if(err) return next(err);
						Category.find({},function(err, category){
							if(err) return next(err);
							Category.findOne({_id: id},function(err,categories){
								if(err) return next(err);
								var pages = 1;
								var name = categories.content;
								if(categories.article.length > 0){
									var pages = Math.ceil(categories.article.length/limit);
								}
								
								res.render('site/category/article',{
									layout:'layout',
									tags: all_tags,
									article: articles,
									category: category,
									pages: pages,
									current_page: page,
									base:'/category/'+id,
									name: name,
									id: id
								});
							});
						});
					});
				});
}


exports.tag = function(req, res, next){
	var page = parseInt(req.query.page, 10) || 1;
	var id = req.params.id;
	var limit = 5;
	Tag.findOne({_id: id},function(err, tag){
		if(err) return next();
		var name = tag.name;
		tag.clickCount = tag.clickCount + 1;
		tag.save(function(err){
			if(err) return next(err);
		});
		var pages = 1;
		var tag_array = [];
		if(tag.article.length > 0){
			pages = Math.ceil(tag.article.length/limit);
		}
		Article
					.find({})
					.where('tag').in([id.toString()])
					.limit(limit)
					.skip((page-1)*limit)
					.populate('tag')
					.sort('-publishtime')
					.exec(function(err, article){
						if(err) return next(err);
						var articles = article;
						article_tran(articles);
						Tag.find({},function(err, all_tags){
							if(err) return next(err);
							Category.find({}, function(err, category){
								if(err) return next(err);
								res.render('site/tag/article',{
									layout:'layout',
									tags: all_tags,
									article: articles,
									category: category,
									pages: pages,
									current_page: page,
									base:'/tag/'+ id,
									name: name,
									id: id
								});
							});
						});
					});

	});
}

exports.notfound = function(req, res){
	res.render('404',{
		layout: 'layout',
		title:'NOT FOUND'
	})
}
