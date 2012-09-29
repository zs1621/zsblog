var Tag = require('../models/tag').Tag();



exports.manage = function(req, res, next){
	if(!req.session.user || req.session.user == null) return res.redirect('/login');
	Tag
		.find()
		.exec(function(err, tags){
			if(err) return  res.flash('error' , 'something wrong with server');
			res.render('tag/tag',{
				layout:'zlayout',
				title:'admin',
				tags: tags,
				user: req.session.user,
				error: req.flash('error').toString(),
				admin:'标签管理'
			})

		});

}

exports.createNew = function(req, res, next){
		if(!req.session.user._id) return res.redirect('/login');
		var text = req.query.text;

		newtag = new Tag({
			name: text
		}) 

		newtag.save(function(err, tag){
			if(err)  return res.redirect('/admin/tag/createnew');
			console.log(tag._id);
			console.log(tag.name);	
			//var msg = '<li class = "tag" id="tag-'+tag._id+'" style="display: inline-table">'+
			//					'<span class="tag_selectable" id="'+tag._id+'">'+tag.name+'</span>'+
			//					'<a class="tag_del" >x</a>'+
			//					'</li>'
			res.json({id: tag._id, name: tag.name});
		})
}


exports.delete = function(req, res, next){
	if(!req.session.user._id) return res.redirect('/login');
	var id = req.query.id;
	Tag.findByIdAndRemove(id, null, function(err){
		if(err)  return res.redirect('/admin/tag/delete');
		res.send('ok');
	})
}