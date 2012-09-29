
exports.uploadImage = function(req, res, next){
	if(!req.session.user || req.session.user == null) {
		res.send({ status: 'fobbiden'});
	}
	method = req.method.toLowerCase();
	if(method == 'post'){
		var file = req.files && req.files.userfile;
		if(!file){
			res.send({ status: 'failed', message: 'no file'});
			return;
		}
		var path = file.path.slice(file.path.indexOf('img')+4);
				var url = '/img/' + path;
				res.send({ status: 'success', url: url }); 

	};

	
} 