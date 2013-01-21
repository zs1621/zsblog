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
		a_array[i].content = a_array[i].content.concat("");
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
	var title = "舜子"
	if(Array.isArray(keyword)){
		keyword = keyword.join(' ');
	}
	keyword = keyword.trim();
	req.session.keyword = keyword;
	var query = {};
	if(keyword){
		keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g,'');
		query ={$or:[{title: new RegExp(keyword,'i')},{content: new RegExp(keyword,'i')}]};
	}

	Article
				.find(query)
				.populate('tag')
				.populate('category')
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
							var pages = Math.ceil(article.length/limit) + 1;
							Category.find({}, function(err, category){
								if(err) return next(err);
								var category = category;
								//判断是否有搜索	
								if(keyword){
									keyword = keyword;
								}else{
									keyword = 0;
								}
								res.render('site/article/list',{
									layout: 'layout',									
									tags: alltags,
									article: article,
									base: '/',
									current_page: page,
									pages: pages,
									category: category,
									user: user,
									keyword: keyword,
									sign:0,
									title:title,
									content:0
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
				.populate('category')
				.exec(function(err, articles){
					if(err) return next(err);
					articles.visitCount = articles.visitCount + 1;
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
							keyword: 0,
							user: user,
							sign:0,
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
				.populate('category')
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
									id: id,
									keyword:0,
									sign:0,
									title:name,
									content:0
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
					.populate('category')
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
									id: id,
									sign:0,
									keyword:0,
									title:name,
									content:0  
								});
							});
						});
					});
	});
}

exports.notfound = function(req, res){
	res.render('404',{
		layout:'layout',
		title:'NOT FOUND',
		content:0
	})
}

exports.about = function(req,res){
	Tag.find({}, function(err, all_tags){
						if(err) return next(err);
						Category.find({}, function(err, category){
							if(err) return next(err);
							return res.render('other/about',{
							title:'关于我',
							category:category,
							tags:all_tags,
							sign:2,
							keyword:0,
							content:3,
						})
					})
	})
}


exports.archive = function(req, res){
	Tag.find({}, function(err, all_tags){
						if(err) return next(err);
						Category.find({}, function(err, category){
							if(err) return next(err);
							Article.find({}).populate('category').select('title publishtime').sort('-publishtime').exec(function(err, articles){
								if(err) return next(err);
								var len = articles.length;
								var articleyear = [];
								var articlemonth = [];
								var articletitle = [];
								var articleList = [];							
								var c = [];
								var alm = [];var am = [];var al = [];
								var n = {};var m = {};
								for(var i=0;i<len;i++){
									articleyear.push(articles[i].publishtime.getFullYear());
									articlemonth.push(articles[i].publishtime.getMonth() + 1);
								}
								articleYear = uniqArray(articleyear);
								articleMonth = uniqArray(articlemonth);
								lenAy = articleYear.length;
								lenAm = articleMonth.length;
								for(var i = 0; i < lenAy; i++){
									al[i] = {};
									for(var j = 0; j < lenAm; j++){
										for(var x = 0,alt = new Array(); x < len ; x++){
											if(articles[x].publishtime.getFullYear() == articleYear[i] && (articles[x].publishtime.getMonth() + 1) == articleMonth[j]){
												alt.push(articles[x].title);
												alm[j] = alt;
												al[i][articleMonth[j]] = alm[j] ;
												n[articleYear[i]] = al[i];
											}
										}				
									}
								}
								return res.render('other/archive',{
								title:"文章存档",
								n:n,
								category:category,
								tags:all_tags,
								sign:1,
								content:0
								})
							})
						})
					})

}

var uniqArray = function(arr){
	var a = [],
			o = {},
			i,
			v,
			len = arr.length;
	if(len < 2){
		return arr;
	}

	for(i=0;i<len;i++){
		v = arr[i];
		if(o[v]!==1){
			a.push(v);
			o[v] = 1;
		}
	}
	return a;
}
