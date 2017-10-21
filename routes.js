var nodemailer=require('nodemailer');
var randtoken=require('rand-token');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var mongo=require('mongodb');
const ClientId = "1061347119197-6m2oqke11i9r9ad51vgq33ho6llpa7j9.apps.googleusercontent.com";
const ClientSecret = "64Ue0BANBlpo9LUa884E70dP";
const RedirectionUrl = "http://localhost:3000/oauthcallback";

module.exports=function(app,passport){

  app.get('/test',isgoogle_authenticated,has_already_taken_test,function(req,res){
   
    var url="mongodb://127.0.0.1:27017/test";
      mongo.connect(url,function(err,db){
          if(err)
         {
           console.log(err);
           res.send(err);
         }
          
          //res.send('success');
           var resultArray=[];
           var cursor = db.collection('Questions').find({});
           cursor.forEach(function(doc){
          resultArray.push(doc);
    }, function(err, doc){
      db.close();
      res.render('Questions.ejs',{data:resultArray});
    });
 });   
  
 });


 
  app.get('/result',function(req,res){
 
 var email=req.session.email;
 var token=req.session.key;
 var count=req.query.score;

 console.log(email);
 console.log(token);
console.log(count);
 console.log(typeof(count));
 count=parseInt(count)
console.log(typeof(count));

var url="mongodb://127.0.0.1:27017/test";   
mongo.connect(url, function(err, db) {
    if (err) {
        console.log('Sorry unable to connect to MongoDB Error:', err);
    } else {
 
        var collection = db.collection('users');
 
        collection.updateOne({
            "email": email,"token":token
        }, {
            $set: {
                "score": count,"opened":1
            }
        }, function(err, results) {
            console.log(results.result);
        });
 
        db.close();
    }
});

   res.send("results will be declared here");

  });


  

app.get('/oauth/google',function(req,res){

    var url=getAuthUrl();
    //console.log(typeof(url));
    var html_code="<html><head><title>Google authenciation Page</title></head><body><a href="+url+">Login using google</a></body></html>";
    res.send(html_code);
   });
  

  app.use("/oauthcallback", function (req, res) {
   
    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code; // the query param code
    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
 
      if(!err) {
        oauth2Client.setCredentials(tokens);
        //saving the token to current session
        session["tokens"]=tokens;
        var p = new Promise(function (resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
        });
    }).then(function (data) {
        req.session.email=(data.emails[0].value);
        res.redirect(req.session.redirecturl);
    })
   
       }
      else{
        res.send("Login failed");
      }
    });
});
  

  app.get('/',function(req,res) {
     

      res.render('index.ejs'); 
  });

  
  app.get('/admin/login/',function (req,res) {

       res.render('login.ejs',{message:req.flash('loginMessage')});
  });


  app.post('/admin/login',passport.authenticate('local-login', {
        successRedirect : '/admin', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


  

  app.get('/admin/signup',function(req,res){
       res.render('signup.ejs',{ message: req.flash('signupMessage') }); 
  });

  app.post('/admin/signup/', passport.authenticate('local-signup', {
        successRedirect : '/admin', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

   
   app.get('/admin/',isLoggedin,function (req,res) {

      var url="mongodb://127.0.0.1:27017/test";
      mongo.connect(url,function(err,db){
          if(err)
         {
           console.log(err);
           res.send(err);
         }
          
          //res.send('success');
           var resultArray=[];
           var cursor = db.collection('users').find({});
           cursor.forEach(function(doc){
          resultArray.push(doc);
    }, function(err, doc){
      db.close();
      res.render('admin.ejs',{data:resultArray});
    });
 });
   });


  app.post('/admin/',isLoggedin,function(req,res) {
  
      var email_id=req.body.email;
      console.log(email_id);
   
     var transporter = nodemailer.createTransport({
      service: 'gmail',
       auth: {
       user: 'adithya.iiitm@gmail.com',
        pass: 'madhavilatha'
        }
      });

var mailOptions = {
  from: 'adithya.iiitm@gmail.com',
  to: '',
  subject: 'Sending Email using Node.js',
  html: '<a href="http://localhost:3000/admin/invite/">Click Here ! </a> ' 
};

var token=randtoken.generate(16);
console.log(token);
console.log(typeof(token));
mailOptions.html='<a href="http://localhost:3000/test?key='+token+'"> Click Here ! </a>';
console.log(mailOptions.html);
mailOptions.to=email_id

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  }
 else {
    console.log('Email sent: ' + info.response);
    var url="mongodb://localhost:27017/test";
    mongo.connect(url,function(err,db){
	       var myobj={};
	       myobj.email=req.body.email;
	       myobj.token=token;
	       myobj.opened=0;
	       myobj.score=0;
	       insertdocument(myobj,db,function(){
		    db.close();
		    res.send("successfull");
	       });
            
    });

    }

  });

});  



var insertdocument=function(myobj,db,callback){
   
   db.collection('users').insertOne(myobj,function(err,result){
  
      console.log('1 document inserted successfully');
      callback();

   });


};



}

function has_already_taken_test(req,res,next)
{
  var is_open;
  var url="mongodb://127.0.0.1:27017/test";
  var resultArray=[];
      mongo.connect(url,function(err,db){
          if(err)
         {
           console.log(err);
           res.send(err);
         }
          
          //res.send('success');
           
           var cursor = db.collection('users').find({'email':req.session.email,'token':req.session.key});
           cursor.forEach(function(doc){
          resultArray.push(doc);
    }, function(err, doc){
      db.close();
       console.log(resultArray);
       if((resultArray.length)===1)
       is_open=resultArray[0].opened;
       if(is_open===0)
  {
     return next();
  }
  
  res.send('you are not authorised to take the test or you have already taken the test');

    });
 });    
 
    

  
}

function isLoggedin(req,res,next)
{
   if(req.isAuthenticated())
   {
      return next();
   }

   res.redirect('/admin/login/');

}

function getmailid(req,res,next)
{
   req.query.key="adi";
   return next();
   
   
}


function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}
 
function getAuthUrl () {
    var oauth2Client = getOAuthClient();
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me',
       'https://www.googleapis.com/auth/userinfo.email'
 ];
 
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });
 
    return url;
}

function isgoogle_authenticated(req,res,next){
   if(req.session.tokens!=undefined)
   {
      return next();
   }
  
   //console.log(req.query.key);
   req.session.key=req.query.key;
   req.session.redirecturl="http://localhost:3000/test?key="+req.query.key;
   console.log(req.session.redirecturl);
   res.redirect('/oauth/google');
}
