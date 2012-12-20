var fs = require('fs');
var UPYun = require('./upyun').UPYun;
var crypto = require('crypto');


// exports.uploadImage = function(req, res, next){
// 	if(!req.session.user || req.session.user == null) {
// 		res.send({ status: 'fobbiden'});
// 	}
// 	method = req.method.toLowerCase();
// 	if(method == 'post'){
// 		var file = req.files && req.files.userfile;
// 		if(!file){
// 			res.send({ status: 'failed', message: 'no file'});
// 			return;
// 		}
// 		var path = file.path.slice(file.path.indexOf('img')+4);
// 				var url = '/img/' + path;
// 				res.send({ status: 'success', url: url }); 

// 	};

	
// } 
exports.uploadImage = function(req, res, next){
		if(!req.session.user || req.session.user == null){
			res.send({ status: 'fobbiden'});
		}
		console.log(req.session.user);
		var upyun = new UPYun('zsblog','rhapsody','zs1261yh');
		fs.readFile(req.files.userfile.path, function(err, original){
			if(err) console.log(err);
			var md5str = md5(original);
			var filename = '/' + req.session.user._id + '/' + md5(Date.now().toString());
			upyun.setContentMD5(md5str);
			upyun.writeFile(filename, original, true, function(err, data){
				if(err) return console.log(err);
				console.log(data);
			})
			var url = 'http://zsblog.b0.upaiyun.com'+filename;
			res.send({ status: 'success', url:url});
		})
	}

function md5(string){
	var md5sum = crypto.createHash('md5');
	md5sum.update(string,'utf-8');
	return md5sum.digest('hex');
}
