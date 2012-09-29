var Category = require('../models/category').Category();
var Tag = require('../models/tag').Tag();
var User = require('../models/user').User();
var Article = require('../models/article').Article();
var Showdown = require('../public/js/showdown');
//var Util = require('../libs/util');


exports.create = function(req, res, next){
	if(!req.session.user) return res.redirect('/login');
	var method = req.method.toLowerCase();
	if(method == 'get'){
			Category.find({}, function(err, categories){
				if(err) return next(err);
				Tag.find(function(err, tags){
					if(err) return next(err);
					res.render('article/create_article',{
						tags: tags,
						categories: categories,
						user: req.session.user,
						layout: 'zlayout',
						title: 'Admin'
					});
					return ;
				})

			})

	}
	if(method == "post"){
		var title = (req.body.title).trim();
		console.log(title.length);
		var content = req.body.t_content;
		var topic_tags = [];
		var category = req.body.category;
		var publishtime = new Date();
		newarticle = new Article({
			title: title,
			content: content,
			category: category,
			authorId: req.session.user._id,
			publishtime: publishtime
		});
		if(req.body.article_tags){
			topic_tags = req.body.article_tags.split(',');
		}
		newarticle.save(function(err){
			if(err) return next(err);
		});
		Article.findOne({_id: newarticle._id}, function(err, article){
			if(err) return next(err);
			if(topic_tags.length > 0){
				for(var i = 0;i < topic_tags.length;i++){
					Tag.findOne({_id:topic_tags[i]}, function(err, tagx){
						if(err) return next(err);
						tagx.article.push(newarticle._id);
						article.tag.push(tagx._id);
						tagx.save(function(err){
						if(err)  return next(err);
					});
					})
			
				}
			}
			Category.findOne({_id: req.body.category}, function(err,category){
				if(err) return next(err);
				category.article.push(article._id);
				category.save(function(err){
					if(err) return next(err);
					article.save(function(err){
						if(err) return next(err);
						return res.redirect('/admin/article/'+article._id+'/edit');
					})
				})
			});
		});
	}
}


var tag_article_sub = function(subtraction,id){
	if(subtraction instanceof Array){
		for(var x = 0; x < subtraction.length; x ++){
			Tag.findOne({_id: subtraction[x]},function(err,tag){
				for(var y = 0; y< tag.article.length; y++){
					if(tag.article[y] == id){
						tag.article.splice(y,1);
						y--;
						}
				}
				tag.save(function(err){
					if(err) return next(err);
				});	
			});		
		}		
	}
}
//把新添加的标签的所包含文章 添加此文id
var tag_article_add = function(addition,id){
	if(addition instanceof Array){
		for( var m = 0; m < addition.length; m++){
			Tag.findOne({_id: addition[m]}, function(err, tag){
				tag.article.push(id);
				tag.save(function(err){
					if(err) return next(err);
				});
			});
		}
	}
}
//将标签里的文章id除去
var category_article_sub = function(sub,id){
	if(sub) {
		Category.findOne({_id: sub}, function(err, category){
			if(err) next(err);
			for(var i = 0; i < category.article.length; i++){
				if(category.article[i] == id){
					category.article.splice(i,1);
					i--;
					category.save(function(err){
						if(err) next(err);
					});
				}
			}
		});
	}
}
//添加标签所含文章id
var category_article_add = function(add,id){
	if(add){
		Category.findOne({_id: add},function(err, category){
			category.article.push(id);
			category.save(function(err){
				if(err) next(err);
			});
		});
	}
}


exports.edit = function(req, res, next){
	if(!req.session.user) return res.redirect('/login');
	var method = req.method.toLowerCase();

	if(method == "get"){
		Article
					.findOne({_id: req.params.id})
					.populate('tag')
					.populate('category')
					.exec(function(err, article){
						console.log(article);
						if(err) return next(err);
						Tag.find({},function(err,tags){
								for(var i = 0; i< article.tag.length; i++){
									for(var j = 0; j< tags.length; j++){
										if(article.tag[i].name == tags[j].name ){
											tags[j].is_selected = true;
										}
									}
								}

						
								Category.find({}, function(err,categories){
									if(err) return next(err);
									for(var i = 0;i<categories.length;i++){
										if(categories[i].content == article.category.content ){
											categories[i].is_selected = true;
										}
									}
									res.render('article/edit_article',{
										layout: 'zlayout',
										title: article.title,
										content: article.content,
										tags: tags,
										categories: categories,
										article: article,
										user: req.session.user
									});
									return;
								});
						});					
					});
							
	}
	if( method == "post" ){
		if(!req.session.user) return res.redirect('/login');
		var title = req.body.title;
		var content = req.body.t_content;	
		var category = req.body.category;
		var article_id = req.params.id;
		console.log(article_id);
		//content = Showdown.parse(content);
		var topic_tags = [];	
		if(req.body.article_tags){
			topic_tags = req.body.article_tags.split(',');
		}
		Article.findOne({_id: article_id},function(err, article){
			if(err) return next(err);
			article.title = title;
			article.content = content;
			if( article.category != category ){
				category_article_sub(article.category, article_id);
				category_article_add(category, article_id);
				article.category = category;
			}	

			//定义两个数组，是为了消同存异
			var older = [];
			var newer = [];

			//把原文章的标签的值赋给数组older
			if(article.tag.length>0){
				for (var i = 0; i < article.tag.length; i++){
					older[i] = article.tag[i];
				}
			}

			//把请求来的标签id赋给数组newer
			if(topic_tags.length>0){
				for(var j = 0; j< topic_tags.length; j++){
					newer[j] = topic_tags[j];
				}
			}

			//console.log(newer);
			//将两个数组中相同项删除
			for(var i = 0; i< older.length; i++ ){
				for(var j = 0; j < newer.length; j++){
					if(newer[j] == older[i]) {
						newer.splice(j,1);j--;
						older.splice(i,1);i--;
					}
				}
			}
			
			//过滤后的older是需要删除的标签，1.此文章包含的这些标签需删除 2.这些标签包含的article需remove
			if(older.length > 0){
				for(var a = 0; a< older.length; a++){
					for(var b = 0; b < article.tag.length; b++){
						if(older[a] == article.tag[b]){
							article.tag.splice(b,1);b--;
						}
					}
				}
				tag_article_sub(older,article_id);
			}
			//过滤后的newer是需要添加的标签；1文章标签需要加上2 这些标签需要加上此文的id
			if(newer.length > 0){
				console.log(newer.length);
				for(var z = 0; z < newer.length; z++){
					article.tag.push(newer[z]);	
				}
				tag_article_add(newer,article_id);
			}
			
			article.save(function(err){
				if(err) return next(err);
		    res.redirect('/article/'+article.title+'/');
			});
		});
	}
}

exports.delete = function(req, res, next){
	if(!req.session.user) return res.redirect('/login');
	var method = req.method.toLowerCase();
	if( method == "get"){
	id = req.params.id;
		Article.findById(id, function(err, article){
			if(err) next(err);
			category_article_sub(article.categoy, id);
			tag_article_sub(article.tag,id);
			category.remove(function(err){
				if(err) return next();
				res.end('ok');
			});
		});
	}
	if( method == "post"){
		if(req.body.id){
			console.log(req.body.id);
			id = req.body.id;
		}
		Article.findById(id, function(err, article){
			if(err) next(err);
			category_article_sub(article.category, id);
			tag_article_sub(article.tag,id);
			article.remove(function(err){
				if(err) return next(err);
				console.log('ok');
				res.end('ok');
			})
		})
	}

}











