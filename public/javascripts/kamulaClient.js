// adds dynamic jquery functionality to the client side page

var slideTime = 600;

var StateEnum = {
  HOME: "HOME",
  REG: "REG",
  LOG: "LOG"
};

var state = StateEnum.HOME;

// deprecated
hideAllViews = function() {
  $(".myView").hide(slideTime);
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

// initialize jquery API funcitonality
// for buttons etc
init = function() {

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
      alert('success');
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

    })
    .fail(function(data) {
      formFail(data);
    })
    .always(function() {

    })
  });

  // register button pressed
  $(".registerButton").click( function() {

    var data = getFormData(".registerView");

    alert( JSON.stringify(data));

    $.post("/register", data, function(recv) {

    })
    .fail(function(data) {
      alert('failed');
      formFail(data);
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
      $(".userList").append( str + '<br>');
    });

    $(".userList").show(slideTime);
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
      $(".tweetList").append( string );
    });

    $(".tweetList").show(slideTime);
  });
}



// easy view switch hooks 
switchToHomeView = function() {
  switchTo(StateEnum.HOME);
}

switchToRegisterView = function() {
  switchTo(StateEnum.REG);
}

switchToLoginView = function() {
  switchTo(StateEnum.LOG);
}