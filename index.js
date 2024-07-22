const express = require("express");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const request = require("request");
const axios = require("axios");


// another test account sonu 
//const FACEBOOK_APP_ID = "1647463849380711";
//const FACEBOOK_APP_SECRET = "618faf3c20a26c68d723195506067245";
//const PAGE_ID = "376529202207282"; 
//const accessToken ="EAAXaXBGFy2cBOx5MCTvjIzhHyi4gt7x1kKgtMTAvh6EwOIIwtqZApMIZC6hcbWuOvBs2GkOpT9r6TatKUlUYsw4hzbVqHOWfZCG3mBEE2ZCn4XPwqReXvq6SLcTAfxbgYSFgkr8OVCt6ZAtVe0xuLmtq1S9LK0d2W8FtBCC9ZC4rik0PuSK8YZBZCc9ZC696M6aA699BLiJUYGIedCWTKZAZCzDj4XBbjOWWDYE"
 
//my acc
const FACEBOOK_APP_ID = "408362738225588";
const FACEBOOK_APP_SECRET = "b9c8424c5ad6e875db706b5e24853880";
const PAGE_ID = "334555959748899"; 
//const accessToken ="EAAFzZA1vzkbQBO2TPZBUxkyuVJJ5pMIXJVRzSSOVNrXHYp74AcKBO4XM0N5adkq3olY1wOzRZBIVEUHC0sTXPVvMRrit9qdiQEjPPPXFz5FSeiRZADgRXkj3nMFfskzZAhL9BfH0sa71ZBjlSf6XcBGRY219XHSkEhtyXOMEq3DnwEasxGDLEPGexGGeRmOokUW5K0APSZB6d7y0i7KsDGFHwQtTiJQCJ90"
   const accessToken= "EAAFzZA1vzkbQBO4zy6rBFYx9Bulnnb5eB1IktKnZC1D5byjZCGxcYSPd5mcBKUuIvnW4HmPMShctqjFfZAi1Kn2c1ImDWht04VfDVWiSGVkMZCpO8yrNjBW4umH0EIRcMGKjcavXdFKHHvb3pyR1XCzAVKoWZCbZAmOhqsryMQeCzR2RhZAtuEkhf3RBR73fRZCpZAQ5Ps2GXF";

  passport.use(
    new FacebookStrategy(
      { 
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"], // Optional: add more profile fields as needed
      },
      function (accessToken, refreshToken, profile, done) {
        // Save the accessToken in the user object for later use
        profile.accessToken = accessToken;
        return done(null, profile);
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  
  const app = express();
  
  app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Route to initiate Facebook login
  app.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["pages_manage_posts"] }) // 'publish_actions' is deprecated, use 'pages_manage_posts' or other permissions as needed
  );
  
  // Facebook callback route
  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/" }),
    (req, res) => {
      console.log(req.user);
      res.redirect("/");
    }
  );

  app.get("/post-axios", async (req, res) => {
    if (!req.isAuthenticated()) {
      //return res.redirect('/auth/facebook');
      return res.status(401).json({ message: "unauthorized and failed" });
    }
  
    const message = "Hello JD, this is a test post from Node.js using axios!";
  
    async function postToFacebook(message) {
      const url = `https://graph.facebook.com/${PAGE_ID}/feed`;
  
      try {
        const response = await axios.post(url, {
          message: message,
          access_token: accessToken,
        });
  
        console.log("Post ID:", response.data.id);
        return true;
      } catch (error) {
        console.error("Error posting to Facebook:", error);
        return false;
      }
    }
    const resultVal = await postToFacebook(message);
  
    return resultVal
      ? res.status(200).json({ message: "post message done" })
      : res.status(500).json({ message: "server err" });
  });

  app.get("/post-photo", async (req, res) => {
    if (!req.isAuthenticated()) {
      //return res.redirect('/auth/facebook');
      return res.status(401).json({ message: "unauthorized and failed" });
    }
  
   // const message = "Hello JD, this is a test post from Node.js using axios!";
   const photoUrl = 'https://png.pngtree.com/png-clipart/20190611/original/pngtree-cute-cartoon-fish-vector-png-image_2628296.jpg'
  
    async function postPhotoToFacebook() {
      const url = `https://graph.facebook.com/${PAGE_ID}/photos?url=${photoUrl}`;
  
      try {
        const response = await axios.post(url, {
            access_token: accessToken,
        });
  
        console.log("Post ID:", response.data.id);
        return true;
      } catch (error) {
        console.error("Error posting to Facebook:", error);
        return false;
      }
    }
    const resultVal = await postPhotoToFacebook();
  
    return resultVal
      ? res.status(200).json({ message: "post photo done" })
      : res.status(500).json({ message: "server err" });
  });



  app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
      res.send(`
                <a href="/post-axios">Post to Facebook using axios</a><br>
                 <a href="/post-photo">Post photo to Facebook using axios</a><br>
                <a href="/logout">Logout</a>`);
    } else {
      res.send('<a href="/auth/facebook">Login with Facebook</a>');
    }
  });

  app.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });