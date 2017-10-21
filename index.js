var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var nodemailer=require('nodemailer');
var mongoose=require('mongoose');
var passport=require('passport');
var flash=require('connect-flash');
var cookieparser=require('cookie-parser');
var session=require('express-session');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var gmail = google.gmail('v1');




var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

require('./config/passport')(passport);

app.use(cookieparser());
app.use(bodyParser());

app.set('view engine', 'ejs');

app.use(session({ secret: '123' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 



require('./routes.js')(app,passport);

/*








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
       
         res.send(req.session.name);
        
      }
      else{
        res.send(`
            &lt;h3&gt;Login failed!!&lt;/h3&gt;
        `);
      }
    });
});



app.use("/details", function (req, res) {
    var oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(req.session["tokens"]);
    console.log("reached here");
    var p = new Promise(function (resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
        });
    }).then(function (data) {
        res.send(data);
    })
   

 
});


app.use("/",function(req,res){
 
   req.session.name="adi";
   
  
});

*/

app.listen(3000);

console.log("application is running");
