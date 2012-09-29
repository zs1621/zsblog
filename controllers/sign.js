var User = require('../models/user').User();
var crypto = require('crypto');


exports.signup = function(req, res, next){

	var method = req.method.toLowerCase();

	if(method == 'get'){
		res.render('sign/signup', { 
			title: '用户注册',
			error: req.flash('error').toString(), 
		});
		return;
	}
	if(method == 'post'){
		var md5 = crypto.createHash('md5');
		var _password = md5.update(req.body.password).digest('base64');
		newuser = new User({
			name: req.body.nickname,
			email: req.body.email,
			password: _password,
		});
		User.findOne({email: newuser.email}, function(err, user){
			if(err) return next(err);
			if(user){
				req.flash('error','邮箱已被注册');
				return res.redirect('/szignup');
				}
			User.findOne({name: newuser.name},function(err, user1){
				if(err) return next(err);
				if(user1) {
					req.flash('error', '用户名已存在');
					return res.redirect('/szignup');
				}		
				newuser.save(function(err,user){
					if(err) {
						req.flash('errorn', err.message);
						return res.redirect('/signup');
					}
					req.session.user = newuser;
					return res.redirect('/login');
				});	
					
			});
		
	})

				
	}
};

exports.login = function(req,res,next){
	
	var method = req.method.toLowerCase();
	if(method == 'get'){
		res.render('sign/login', {
			title:'用户登录',
			error: req.flash('error').toString(),

		});
		return;
	}
	if(method == 'post'){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		User.findOne({name: req.body.nickname}, function(err, user){
			if(err) return next(err);
			if(!user){
				req.flash('error','用户不存在');
				return res.redirect('/login');
			}
			if(user.password !== password){
				req.flash('error','密码输入有误');
				return res.redirect('/login');
			}else{
				req.session.user = user;				
				res.redirect('/');
			}
		})
	}
}


exports.logout = function(req,res){
	req.session.destroy();
	res.redirect('/');
}


exports.find = function(req, res, next){
	var method = req.method.toLowerCase();
	if( method == "get"){
	res.render('sign/find',{
		title: '找回密码',
		error: req.flash('error').toString()
	});
	}
	if(method == "post"){
		var mail = req.body.mail;

		User.findOne({email: mail},function(err, user){
			if(err) return next(err);

			if(!user) {
				req.flash('error', 'email不存在');
				return res.redirect('/find_pass');
			}
			//smtp service
			var server = require("emailjs/email").server.connect({
				host: "smtp.gmail.com",
				user:"zs1213yh@gmail.com",
				password:"zs1261yh",
				ssl: true
			})
			//active_key
			var key = randomString(20);

			user.active_key = key;
			user.save();
			var link = "http://127.0.0.1:3000/password/reset?u="+key+"&name="+user.name;
			var html = '<div id="mail">'+
									'<p>'+ user.name+':</p>'+
									'<p>点击下面的网址，修改您的密码</p>'+'<br/>'+
									'<a href="'+link+'">'+link+
									'</div>';
			//mail address
			var mailurl = mail.slice(mail.indexOf('@')+1);
			url = 'http://mail' +'.'+ mailurl;
			//send  content
			var message = {
				text:'works',
				subject:"重置密码",
				from:"zs1213yh@gmail.com",
				to: mail,
				attachment:[{data: html, alternative: true}]
			};
			server.send(message, function(err){
				if(err) return next(err);
				res.render('sign/active_account',{
					title:'去邮箱改密码',
					active_url:url
				});
			})
		});
	}
	
}


exports.reset = function(req, res, next){
	var method = req.method.toLowerCase();
	if(method == 'get'){
		var key = req.query.u;
		var name = req.query.name;
		User.findOne({name: name},function(err, user){
			if(err) return next(err);
			if(user.active_key == key){
				return res.render('sign/modify_password',{
					title:'重置密码',
					name: user.name,
					key: key
				});
			}else{
				return res.render('note',{
					error: '错误的链接',
				})
			}
		})
	}
	if(method == 'post'){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var name = req.body.nickname;
		var key  = req.body.key;
		User.findOne({name: name,active_key:key},function(err, user){
			if(err) return next(err);
			if(!user) return res.render('note',{error:'错误的激活链接'});

			user.password = password;
			user.active_key = null;
			user.save(function(err){
				if(err) return next();
				return res.render('note', {success: '密码已重置'});
			});
		});
	}
}



function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
   
    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }
   
    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}