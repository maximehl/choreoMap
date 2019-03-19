module.exports = function(app){

  var User = require("../app/models/user")
  var ChoreoInfo = require("../app/models/choreoInfo")
  var ChoreoData = require("../app/models/choreoData")

  //get section
  app.get('/', function(req, res) {
    var usernameStore = req.cookies.username
    if(usernameStore&&!(req.session.user && req.cookies.uSessionID)){
      console.log('clearing cookies')
      res.clearCookie('username')
      res.clearCookie('uSessionID')
      usernameStore = "";
    }
    console.log('get homepage')
    res.render('index.ejs', {username: usernameStore})
  })

  app.get('/login', function(req,res){
    console.log('get login page')
    res.clearCookie('username')
    res.clearCookie('uSessionID')
    res.render('login.ejs', {status:req.query.status})
  })

  app.get('/signup', function(req,res){
    console.log('get signup page')
    res.render('signup.ejs')
  })

  app.get('/view', function(req,res){
    var usernameStore = req.cookies.username
    if(usernameStore&&!(req.session.user && req.cookies.uSessionID)){
      console.log('clearing cookies')
      res.clearCookie('username')
      res.clearCookie('uSessionID')
      usernameStore = "";
    }
    if(req.query.id){
      console.log('get choreo view page for "' + req.query.id + '"')
      ChoreoInfo.findOne({choreoName: req.query.id}, function(err, choreo){
        if(err) throw err
        if(choreo){
          res.render('viewPage.ejs', {choreoName:req.query.id})
        }else{
          res.redirect('/view?status=miss' + req.query.id)
          //res.render('missingChoreo.ejs', {choreoName:req.query.id})
        }
      })
    }else{
      console.log('get choreo view index')
      ChoreoInfo.find({}, function(err, choreoInfos){
        if(err) throw err
        res.render('viewIndex.ejs', {username: usernameStore, data: choreoInfos, status:req.query.status})
      })
    }

  })

  app.get('/edit', function(req,res){
    if(req.session.user && req.cookies.uSessionID){
      if(req.query.id){
        ChoreoInfo.findOne({choreoName: req.query.id}, function(err, choreo){
          if(err) throw err
          if(!choreo){
            res.redirect('/edit?status=miss' + req.query.id)
            //res.render('missingChoreo.ejs', {choreoName:req.query.id})
          }else if(choreo.owner!==req.cookies.username){
            console.log('no permission to access "' + req.query.id + '"')
            res.redirect('/edit?status=permission')
            //res.redirect('/edit', {status:'permission'})
          }else{
            console.log('get choreo edit page for "' + req.query.id + '"')
            res.render('editPage.ejs', {choreoName:req.query.id, choreoID:req.query.id})
            //don't even need to encodeURI, but if I did: encodeURI(req.query.id)
          }
        })
      }else{
        console.log('get choreo edit index')
        ChoreoInfo.find({owner: req.cookies.username}, function(err, choreoInfos){
          if(err) throw err
          res.render('editIndex.ejs', {username: req.cookies.username, data: choreoInfos, status:req.query.status})
        })
      }
    }else{
      res.redirect('/login')
    }
  })

  app.get('/checkUser', function(req,res){
    User.find({username:req.query.username}, function(err, user){
      if(err) throw err
      res.send(user)
    })
  })

  app.get('/logout', function(req,res){
    res.clearCookie('username')
    res.clearCookie('uSessionID')
    res.redirect('/')
  })

  app.get('/edit/create', function(req,res){
    if(req.session.user && req.cookies.uSessionID){
      console.log('get choreo create new')
      res.render('createChoreo.ejs', {username: req.cookies.username})
    }else{
      res.redirect('/login')
    }
  })

  app.get('/edit/delete', function(req,res){
    console.log('deleting choreo "' + req.query.id + '"')
    ChoreoInfo.findOneAndDelete({choreoName:req.query.id}, function(err, choreo){
      if(err) throw err
      console.log(choreo)
    });
    ChoreoData.findOneAndDelete({choreoName:req.query.id}, function(err, choreo){
      if(err) throw err
      console.log(choreo)
    });
    res.redirect('/edit')
  })

  app.get('/checkChoreo', function(req,res){
    ChoreoInfo.find({choreoName:req.query.choreoName}, function(err, choreo){
      if(err) throw err
      res.send(choreo)
    })
  })

  app.get('/choreoData', function(req,res){
    ChoreoData.find({choreoName:req.query.id}, function(err, choreo){
      if(err) throw err
      res.send(choreo)
    })
  })




  //post section
  app.post('/signup', function(req,res){
    console.log('make a new user')
    var newUser = new User()
    newUser.username = req.body.username
    newUser.password = req.body.password
    console.log(newUser)
    newUser.save()
    req.session.user = newUser.username
    res.cookie("username", newUser.username)
    res.redirect('/edit')
  })

  app.post('/login', function(req,res){
    console.log('logging in')
    User.findOne({username:req.body.username}, function(err, user){
      if(err) throw err
      if(user&&user.password===req.body.password){
        req.session.user = user.username
        res.cookie("username", user.username)
        res.redirect('/edit')
      }else{
        res.redirect('/login?status=fail')
      }
    })
  })

  app.post('/edit/create', function(req,res){
    console.log('creating new choreo')
    var newChoreoInfo = new ChoreoInfo()
    newChoreoInfo.choreoName = req.body.choreoName
    newChoreoInfo.owner = req.body.owner
    newChoreoInfo.fileLink = req.body.fileLink
    newChoreoInfo.save()

    var newChoreoData = new ChoreoData()
    newChoreoData.choreoName = req.body.choreoName
    newChoreoData.fileLink = req.body.fileLink
    newChoreoData.formations[0] = {formName: "Formation 1", timecode: 0, moveLength: 0}
    newChoreoData.save()
    res.redirect('/edit?id=' + req.body.choreoName)
  })

  app.post('/edit', function(req,res){
    console.log("testing fun things")
    ChoreoData.findOneAndUpdate({choreoName:req.body.choreoName},
      {
        performers: req.query.performers,
        groups: req.query.groups,
        formations: req.query.formations,
      },
      function(err, choreoData){
        if(err) throw err
        //tagHere
    })
  })
}
