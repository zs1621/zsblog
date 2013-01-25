exports.show = function (req,res,next) {
	var pathName = req.params.static;
	res.render('site/demo/'+ pathName,{layout:false})
}
