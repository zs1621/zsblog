var Category = require('../models/category').Category();



exports.manage = function(req,res,next){
	if(!req.session.user || req.session.user===null) {console.log(req.session.user);return res.redirect('/login');}
	 Category
	 				.find({userId: req.session.user._id })
 					.sort({createTime:'desc'})
	 				.exec(function(err,categories){
 					if(err) return res.flash('error','server question');
	 					res.render('category/category',{
	 						layout:'zlayout',
							title: 'admin',
							categories: categories,
							user: req.session.user,
							error: req.flash('error').toString(), 
							admin: '目录管理'

						})
				 					
 				});
	
}	




exports.createNew = function(req, res, next){
	if(!req.session.user._id) return res.redirect('/login');
	var text = req.query.text;
	var id = req.session.user._id;

	newcategory = new Category({
		content: text,
		userId: id
	});
	newcategory.save(function(err,category){
		if(err) {
			res.flash('create-fail','目录创建失败');
			return res.redirect('/admin/category/new');
		}
		
		var msg =  '<li id="category-'+ category._id +'" class="category">'+
	 
	                '<div class="text">'+ category.content +'</div>'+
	 
	               '<div class="actions">'+
	                   ' <a href="" class="edit">Edit</a>'+
	                   ' <a href="" class="delete">Delete</a>'+
	                '</div>'+
	            '</li>'
		
		res.send(msg);
	})
}

exports.edit = function(req, res, next){
	if(!req.session.user || req.session.user == null) return res.send('/')
	var text = req.query.text;
	console.log(text);
	var id = req.query.id;
	Category.findByIdAndUpdate(id,{content:text},{new:true},function(err,category){
		if(err) return res.redirect('/admin/category/edit');
		console.log(category.content);
		res.json({content:category.content});
		
	})

}

exports.delete = function(req, res, next){
	var id = req.query.id;
	Category.findByIdAndRemove(id,null,function(err){
		if(err) return res.redirect('/admin/category/delete');
		res.send('ok');
	})
}

