/**
* Module dependencies
*/

//var comment = require('./controllers/comment');
var site = require('./controllers/site');
var sign = require('./controllers/sign');
var category = require('./controllers/category');
var tag = require('./controllers/tag');
var operate_article = require('./controllers/operate_article');
var article = require('./controllers/article');
var upload = require('./controllers/upload');
var demo = require('./controllers/demo');

module.exports = function(app){

	//signup login find_code
	app.get('/szignup', sign.signup);
	app.post('/szignup', sign.signup);
	app.get('/login', sign.login);
	app.post('/login', sign.login);
	app.get('/logout', sign.logout);
	app.get('/find_pass',sign.find);
	app.post('/find_pass',sign.find);
	app.get('/password/reset',sign.reset);
	app.post('/password/reset',sign.reset);
	
	//site
	app.get('/',site.index);
	app.get('/article/:title',site.article);
	app.get('/category/:id', site.category);
	app.get('/tag/:id', site.tag);
	app.get('/about',site.about);
	app.get('/archive',site.archive);




	//category manage
	app.get('/admin/category/manage',category.manage);
	app.get('/admin/category/createnew',category.createNew);
	app.get('/admin/category/edit',category.edit);
	app.get('/admin/category/delete',category.delete);


	//tag manage
	app.get('/admin/tag/manage', tag.manage);
	app.get('/admin/tag/createnew', tag.createNew);
	app.get('/admin/tag/edit', tag.edit);
	app.get('/admin/tag/delete', tag.delete);

	//operate_arctile 
	app.get('/admin/article/operate_article', operate_article.operate);
	app.post('/admin/article/operate_article',operate_article.operate);

	//arctile manage
	app.get('/admin/article/create', article.create);
	app.post('/admin/article/create', article.create);
	app.get('/admin/article/:id/edit', article.edit);
	app.post('/admin/article/:id/edit', article.edit);
	app.post('/admin/article/:id/delete', article.delete);
	app.get('/admin/article/:id/delete', article.delete);

	//demo show
	app.get('/demo/:static',demo.show);
	// upload image
	app.post('/upload/image', upload.uploadImage);
	

}
