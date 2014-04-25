// adds dynamic jquery functionality to the client side page

var userName = '';
var lastLoginState = false;
var currentProfile = '';
var userJson;

var fullUserList = [];

var slideTime = 600;

var StateEnum = {
  HOME: "HOME",
  MAIN: "MAIN",
  REG: "REG",
  LOG: "LOG",
  PROFILE: "PROFILE",
  ADDFRIEND: "ADDFRIEND"
};

var state = StateEnum.HOME;

// deprecated
hideAllViews = function() {
  $(".myView").hide(slideTime);
}

hideAllViewsNow = function() {
  $(".myView").hide(0);
}

switchTo = function(view) {
  if (typeof view === "string") {
    state = view;

    // hide other views, show current view
    for (var v in StateEnum) {
      if (v !== view) { // hide this view
        $(".myView." + v).slideUp(slideTime);
      } else {  // show this view
        $(".myView." + v).show(slideTime);
      }
    }
  }
}




// get register/login data from form
var getFormData = function(view) {
  var data = {
      user: $(view + " .myUsernameInput").val(),
      name: $(view + " .myFullNameInput").val(),
      email: $(view + " .myEmailInput").val(),
      password: $(view + " .myPasswordInput").val()
    };

    return data;
}

var formFail = function(data) {
  var json = data.responseJSON;

  console.log(json.errorSource);
  console.log(json.message);

  var element = $('.' + state + ' .' + json.errorSource);
  element.toggleClass("has-error", true);
  setTimeout(function() {
    element.toggleClass("has-error", false);
  }, 3000);
}


// called when the user login state switches for on/off
var stateSwitch = function() {
}


var isAuth = function(authed, failed) {
  $.get('/auth', function(data) {
    if (!lastLoginState) {
      lastLoginState = true;
      stateSwitch();
    }

    var json = JSON.parse(data);
    userJson = JSON.parse(data);

    authed(json);
    setName(json.user);
    userName = json.user;
    $("#anonNav").hide();
    $("#authNav").show();
  })
     .fail( function() {
      if (lastLoginState) {
        lastLoginState = false;
        stateSwitch();
      }
       failed();
       $("#anonNav").show();
       $("#authNav").hide();
     });
}

// insert tweet into tweet
var addTweet = function(className, user, text, tweetId) {
  var tweetList = $("."+className+" .tweetList");

  var string = '<div class="tweet"><li class="media '+tweetId+'" hidden tweetId="'+tweetId+'"> \
                <a class="pull-left" href="#"> \
                  <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                </a> \
                <div class="media-body" tweetId="'+tweetId+'"> \
                  <h4 class="media-heading">'+ (user || 'Anon') +'</h4> \
                  '+text+' \
                </div> \
              </li></div>';

  tweetList.prepend(string);

  // get the new list
  var tweetListli = $("."+className+" .tweetList li");
  // animate it a little bit
  var e = tweetListli.first();
  e.hide().show(600);
  return e;
}

// initialize jquery API funcitonality
// for buttons etc
init = function() {

  // test button
  $("#TestLink").click(function() {
     isAuth( function(data) {
      console.log('Authorized');
      console.log( data );
     }, function() {
      console.log('Unauthorized');
     });
  });

  // init buttons
  $("#RegisterLink").click( function() {
    switchToRegisterView();
  });

  $("#LoginLink").click( function() {
    switchToLoginView();
  });

  $("#HomeLink").click( function() {
    switchToMainPage()
  });

  $("#LogoutLink").click( function() {
    $.get("/logout", function() {
    })
      .done(function() {        
        navBarAnon();
        $(".PROFILE tweetList").empty();
        switchToHomeView();
      })
      .fail(function() {
      });
  });

  // Profile button
  $("#ProfileLink").click( function() {
    switchToProfileView();
  });

  // Add Friend button
  $("#AddFriendLink").click( function() {

    // get and populate the user list without users
    // who are already your friends
    isAuth(function(selfjson) {

      // get full list of users and remove all friends
      $.getJSON("/users", function( data ) {
        $.each( data, function( key, val) {

          var skip = false;
          // skip this if it is a friend
          for (var i = 0; i < selfjson.friends.length; i++) {
            if (val._id == selfjson.friends[i]) {
              skip = true;
              break;
            }
          }

          if (!skip) {
            // create the element
            var str = '<a href="#" class="list-group-item">'+ (val.name || val.user) +'</a>';
            // add it to the list
            $(".ADDFRIEND .userList").append( str + '<br>');
            // add click functionality
            $(".ADDFRIEND .userList a:last").click(function() {

              var data = {
                user: selfjson.user,
                user_id: selfjson._id,
                friend: val.user,
                friend_id: val._id
              };

              //alert(JSON.stringify(data));

              $.ajax( {
                type: 'POST',
                url: '/addfriend',
                data: JSON.stringify(data),
                success: function(data) {
                  console.log("Successfully Added a friend!!");
                  console.log(data);
                  var str = '<a href="#" class="list-group-item">'+ (data.friend) +'</a>';
                  $(".MAIN .userList").prepend( str + '<br>');
                  var e = $(".MAIN .userList a").first();
                  e.hide().show(600);
                  e.click(function() {
                    var p = this.text;
                    switchToProfileOf(p);
                  });
                },
                error: function() {
                  alert("Error adding friend.");
                },
                contentType: "application/json",
                dataType: 'json'
              });
            });
          }
        });

        $(".ADDFRIEND .userList").show(slideTime);
      });

    }, function() {
      alert("Not logged in.");
      switchToLoginView();
    });

    switchToAddFriendView();
  });

  // Writing tweet
  $(".TwiitWritePanel button").click( function() {
    var text = $(".TwiitWritePanel input").val();
    $(".TwiitWritePanel input").val('');
    
    isAuth( function(selfjson) {
      // TODO verify tweet length etc

      //addTweet("PROFILE", selfjson.user, text);

      var data = {
        user: selfjson.user,
        content: text
      };

      // send the data to the server
      $.ajax({
        type: 'POST',
        url: '/twiit',
        data: JSON.stringify(data),
        success: function(data) { 
          console.log('successfully sent tweet');
          console.log(data);
         },
        error: function() {console.log("Error sending tweet.")},
        contentType: "application/json",
        dataType: 'json'
      });

    }, function() {
      alert("Not logged in.");
      switchToLoginView();
    });
    
  });

  // login button pressed
  $(".loginButton").click( function() {
    var dataOut = getFormData(".loginView");
  
    // handle the request
    var jqhxr = $.post( "/login", dataOut, function( data ) {
      console.log( JSON.stringify(data) )
    })
    .done(function() {
      navBarAuth();
      setName(dataOut.user);
      switchToMainPage();
    })
    .fail(function(data) {
      navBarAnon();
      formFail(data);
    })
    .always(function() {

    })
  });

  // register button pressed
  $(".registerButton").click( function() {

    var data = getFormData(".registerView");

    //alert( JSON.stringify(data));

    $.post("/register", data, function(recv) {

    })
    .done(function(data) {
      navBarAuth();
      setName(data.user);
      switchToMainPage();
      console.log(data);
    })
    .fail(function(data) {
      console.log("Failed to register.");
      formFail(data);
      navBarAnon();
    })
  });

  $(".myUpdateForm .updateButton").click( function() {
    var data = getFormData(".myUpdateForm");
    data.user = userName;

    $.ajax( {
      type: 'PUT',
      url: 'api/users/' + userName.toLowerCase(),
      data: JSON.stringify( data ),
      success: function(data) {
        // update the update view
        console.log("UPDATED SUCCESSFULLY");
        console.log(data);
      },
      error: function() {
        console.log("Failed to updated.");
      },
      contentType: 'application/json',
      dataType: 'json',
    });
  });

  $(".myUpdateForm .deleteButton").click( function() {
    var data = getFormData(".myUpdateForm");
    data.user = userName;

    $.ajax( {
      type: 'DELETE',
      url: 'api/users/' + userName.toLowerCase(),
      data: JSON.stringify( data ),
      success: function(data) {
        // update the update view
        console.log("DELETED SUCCESSFULLY");
        console.log(data);
        switchToMainPage();
      },
      error: function() {
        console.log("Failed to DELETE.");
      },
      contentType: 'application/json',
      dataType: 'json',
    });
  });

}

// gets the initial data for the home page
pageInit = function() {
  // get users list through api
  $.getJSON("/users", function( data ) {
    fullUserList = [];
    $.each( data, function( key, val) {
      fullUserList.push(val);

      console.log(val);
      var str = '<a href="#" class="list-group-item">'+ (val.name || val.user) +'</a>';
      $(".HOME .userList").append( str + '<br>');
      $(".HOME .userList a").last().click(function() {
        var p = this.text;
        switchToProfileOf(p);
      });
    });

    $(".HOME .userList").show(slideTime);
  });

  // get latest tweets through api
  $.getJSON("/latest", function( data ) {
    $.each( data, function( key, val) {
      //console.log(val);
      var string = '<li class="media"> \
                      <a class="pull-left" href="#"> \
                        <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                      </a> \
                      <div class="media-body"> \
                        <h4 class="media-heading">'+val.user.user+'</h4> \
                        '+val.content+' \
                      </div> \
                    </li>';
      $(".HOME .tweetList").append( string );
    });

    $(".HOME .tweetList").show(slideTime);
  });
}


/**
  * Load friends list
  */
var loadFriendsList = function(self) {
  $.getJSON('/friends/' + self.user, function(data) {
    var flist = $(".MAIN .userList").empty();

    var friends = data.friends;

    for (var i = 0; i < friends.length; i++) {
      var f = friends[i];
      console.log(f.user);
      console.log(f);
      var str = '<a href="#" class="list-group-item">'+ (f.user) +'</a>';
      flist.prepend(str + '<br>');
      $(".MAIN .userList a").first().click(function() {
        var p = this.text;
        switchToProfileOf(p);
      });
    }
  })
}



/**
  * NavBar switching from logged in and not logged in mode
  */
navBarAnon = function() {
  $("#anonNav").show();
  $("#authNav").hide();
  $("#userNameId").text( "Not logged in." );
}
navBarAuth = function() {
  $("#anonNav").hide();
  $("#authNav").show();
}
setName = function(name) {
  $("#userNameId").text( "Welcome, " + name );
}

/**
  * helper state switching hooks
  */
switchToMainPage = function() {
  isAuth(function(data) {
    // hide content for anons
    navBarAuth();

    // load friends list
    console.log(data.friends || []);
    loadFriendsList(data);

    // logged in
    switchToMainView();
  }, function() {
    // show content for anons
    navBarAnon();

    switchToHomeView();
  });
}

switchToHomeView = function() {
  switchTo(StateEnum.HOME);
}

switchToMainView = function() {
  // get latest friend tweets
  // get latest tweets through api
  $.getJSON("/latestfriends", function( data ) {
    $(".MAIN .tweetList").empty();

    $.each( data, function( key, val) {
      //console.log(val);
      var string = '<li class="media"> \
                      <a class="pull-left" href="#"> \
                        <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                      </a> \
                      <div class="media-body"> \
                        <h4 class="media-heading">'+val.user.user+'</h4> \
                        '+val.content+' \
                      </div> \
                    </li>';
      $(".MAIN .tweetList").append( string );
    });

    $(".MAIN .tweetList").show(slideTime);
  });



  switchTo(StateEnum.MAIN);
}

switchToRegisterView = function() {
  switchTo(StateEnum.REG);
}

switchToLoginView = function() {
  switchTo(StateEnum.LOG);
}


/**
  * Load tweets and comments in the profile views
  */

// helper function
var newComment = function(user, content) {
        var comment = '<li class="media comment"> \
                      <a class="pull-left" href="#"> \
                        <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                      </a> \
                      <div class="media-body"> \
                        <h4 class="media-heading">'+user+'</h4> \
                        '+content+' \
                      </div> \
                    </li>';
        return comment;
      }

var getNameOfId = function(id) {
  for (var i = 0; i < fullUserList.length; i++) {
    var user = fullUserList[i];
    if (user._id == id) {
      return user.user;
    }
  }
}

var loadProfileTweetsAndComments = function(userName) {
  if (!userName) {
    userName = currentProfile;
  }

  $(".PROFILE tweetList").empty();

  console.log("username: " + userName);
  // load profile tweets
  $.get('/tweets/' + userName, function(data) {
    var tweets = data;

    for (var i = 0; i < tweets.length; i++) {
      var tweet = tweets[i];
      var e = addTweet("PROFILE", userName, tweet.content, tweet._id);

      // add hidden comments after the tweet
      // that are shown when the tweet is clicked
      var div = '<div class="commentDiv '+ tweet._id +'" hidden>';

      var comments = tweet.comments;
      for (var n = 0; n < comments.length; n++) {
        var name = getNameOfId(comments[n].user);

        var comment = newComment(name, comments[n].content );
        div += comment;
      }

      // add write new comment box if user is logged in
      if (lastLoginState) {
        div += '<div class="writeComment">'
        div += '<input type="text" placeholder="write comment">'
        div += '   <button tweetId="'+tweet._id+'" type="submit" class="btn btn-primary">Comment!</button>'
        div += '</div>';
      }

      div += '</div>'

      e.append(div);

      console.log(tweet._id);

      var tid = tweet._id;
      // show/hide comments
      $("." + tid + " div.media-body").click( function() {
        var tid = this.getAttribute("tweetId");
        console.log(this);
        console.log("CLICK: " + tid);
        $(".commentDiv." + tid).toggle(slideTime);
      });

      /*
            var string = '<div class="tweet"><li class="media '+tweetId+'" hidden tweetId="'+tweetId+'"> \
                <a class="pull-left" href="#"> \
                  <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                </a> \
                <div class="media-body"> \
                  <h4 class="media-heading">'+ (user || 'Anon') +'</h4> \
                  '+text+' \
                </div> \
              </li></div>';
      */

      // override last click event for the write button
      if (lastLoginState) {
        // add button functionality for writing comment
        $(".commentDiv." + tid + " .writeComment button").click(function() {
          var tid = this.getAttribute("tweetId");
          var input = $(".commentDiv." + tid + " .writeComment input");
          var text = input.val();

          if (text.length < 1)
            return;

          var data = {
            tweetId: tid,
            content: text
          }

          // make ajax post request
          $.ajax( {
            type: 'POST',
            url: '/addcomment',
            data: JSON.stringify(data),
            success: function(data) {
              console.log("Successfully Added a comment!!");
              console.log(data);
              var str = newComment(userName, text);
              $(".commentDiv." + tid).prepend( str );
            },
            error: function() {
              alert("You need to be logged in to comment.");
            },
            contentType: "application/json",
            dataType: 'json'
          });

          console.log("COMMENT BUTTON CLICKED!!: " + text);
          input.val('');
        });
      }

    }
  })
    .fail( function() {
      console.log("Failed to updated proifle tweets")
    });
}

// switch to users own profile
switchToProfileView = function() {
  currentProfile = userName;
  // Show my own tweets

  // load profile tweets and between two ferns
  loadProfileTweetsAndComments(userName); // global userName variable
  
  $(".PROFILE .profileName").text(userName + "'s Tweets");

  $(".myUpdateForm .myUsernameInput").attr("placeholder", userName);
  $(".myUpdateForm .myFullNameInput").attr("placeholder", userJson.name);
  $(".myUpdateForm .myEmailInput").attr("placeholder", userJson.email);
  $(".myUpdateForm .myPasswordInput").attr("placeholder", 'Password');

  $(".PROFILE .auth").show();
  switchTo(StateEnum.PROFILE);
}

switchToAddFriendView = function() {
  switchTo(StateEnum.ADDFRIEND);
}

// switch to ANOTHER users profile
switchToProfileOf = function(user) {
  currentProfile = user;
  //
  loadProfileTweetsAndComments(user);
  $(".PROFILE .profileName").text(user + "'s Tweets");


  console.log("Switching to profile of: " + user)

  $(".PROFILE .auth").hide();
  switchTo(StateEnum.PROFILE);
}