module.exports = function(app){
  //get section
  app.get('/', function(req, res) {
    console.log('get homepage')
    res.render('index.ejs')
  })

  app.get('/login', function(req,res){
    console.log('get login page')
    res.render('login.ejs')
  })

  app.get('/signup', function(req,res){
    console.log('get signup page')
    res.render('signup.ejs')
  })

  app.get('/viewIndex', function(req,res){
    console.log('get choreo mainpage')
    res.render('choreoIndex.ejs')
  })

  app.get('/editIndex', function(req,res){
    console.log('get choreo mainpage')
    res.render('editPage.ejs')
  })



  //post section
  var User = require("../app/models/user")
  app.post('/signup', function(req,res){
    console.log(req.body);
    User.find({username:req.body.username}, function(err, user){
      console.log(user);
      if(err) throw err;
      if(user.length>0){
        console.log('user exists already');
        //a user with this username exists... don't create a new user
        //tagHere
      }else{
        var newUser = new User()
        newUser.username = req.body.username
        newUser.password = req.body.password
        newUser.save()
        res.redirect('/editIndex', {username:req.body.username})
      }
    })
    console.log('make a new user')

  })
}
