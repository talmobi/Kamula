// adds dynamic jquery functionality to the client side page

var userName = '';

var slideTime = 600;

var StateEnum = {
  HOME: "HOME",
  REG: "REG",
  LOG: "LOG",
  PROFILE: "PROFILE"
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

var isAuth = function(authed, failed) {
  $.get('/auth', function(data) {
    var json = JSON.parse(data);
    authed(json);
    setName(json.user);
    userName = json.user;
    $("#anonNav").hide();
    $("#authNav").show();
  })
     .fail( function() {
       failed();
       $("#anonNav").show();
       $("#authNav").hide();
     });
}

// insert tweet into tweet
var addTweet = function(className, user, text) {
  var tweetList = $("."+className+" .tweetList");

  var string = '<li class="media" hidden> \
                <a class="pull-left" href="#"> \
                  <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                </a> \
                <div class="media-body"> \
                  <h4 class="media-heading">'+ (user || 'Anon') +'</h4> \
                  '+text+' \
                </div> \
              </li>';

  tweetList.prepend(string);

  // get the new list
  var tweetListli = $("."+className+" .tweetList li");
  // animate it a little bit
  tweetListli.first().hide().show(600);
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
    switchToHomeView()
  });

  $("#LogoutLink").click( function() {
    $.get("/logout", function() {
    })
      .done(function() {
        navBarAnon();
        switchToHomeView();
      })
      .fail(function() {
      });
  });

  // Profile button
  $("#ProfileLink").click( function() {
    switchToProfileView();
  });

  // Writing tweet
  $(".TwiitWritePanel button").click( function() {
    var text = $(".TwiitWritePanel input").val();
    
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
  
    alert( JSON.stringify(dataOut));

    // handle the request
    var jqhxr = $.post( "/login", dataOut, function( data ) {
      console.log( JSON.stringify(data) )
    })
    .done(function() {
      navBarAuth();
      setName(dataOut.user);
      switchToHomeView();
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
      switchToHomeView();
      console.log(data);
    })
    .fail(function(data) {
      console.log("Failed to register.");
      formFail(data);
      navBarAnon();
    })
  });

}

// gets the initial data for the home page
pageInit = function() {
  // get users list through api
  $.getJSON("/users", function( data ) {
    $.each( data, function( key, val) {
      console.log(val);
      var str = '<a href="#" class="list-group-item">'+ (val.name || val.user) +'</a>';
      $(".HOME .userList").append( str + '<br>');
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

// helper state switching hooks
switchToMainPage = function() {
  isAuth(function() {
    // hide content for anons
    navBarAuth();

    // logged in
    switchToProfileView();
  }, function() {
    // show content for anons
    navBarAnon();

    // not logged in
    switchToHomeView();
  });
}

switchToHomeView = function() {
  switchTo(StateEnum.HOME);
}

switchToRegisterView = function() {
  switchTo(StateEnum.REG);
}

switchToLoginView = function() {
  switchTo(StateEnum.LOG);
}

switchToProfileView = function() {
  switchTo(StateEnum.PROFILE);
}