// adds dynamic jquery functionality to the client side page

var slideTime = 600;

var StateEnum = {
  HOME: "HOME",
  REG: "REG",
  LOG: "LOG"
};

var state = StateEnum.HOME;

hideAllViews = function() {
  $(".myView").hide(slideTime);
}

switchTo = function(view) {
  console.log("In SwitchTo");

  if (typeof view === "string") {
    console.log("Correct typeof");

    state = view;

    for (var v in StateEnum) {
      console.log(v);
      if (v !== view) {
        console.log(".myView." + v);
        $(".myView." + v).slideUp(slideTime);
      } else {
        $(".myView." + v).show(slideTime);
      }
    }

    //$("myView." + view).show(slideTime);
  }
}

switchToHomeView = function() {
  switchTo(StateEnum.HOME);
}


// get register/login data from form
var getFormData = function(view) {
  var data = {
      username: $(view + " .myUsernameInput").val(),
      email: $(view + " .myEmailInput").val(),
      password: $(view + " .myPasswordInput").val()
    };

    return data;
}

// initialize jquery API funcitonality
// for buttons etc
init = function() {

    $(".loginButton").click( function() {
    var data = getFormData(".loginView");
  
    alert( JSON.stringify(data));

  // handle the request
    var jqhxr = $.post( "/login", function(data) {
      alert("success");
    })
    .done(function() {
      alert("second success");
    })
    .fail(function() {
      alert("error");
    })
    .always(function() {
      alert("finished");
    })
  });

  $(".registerButton").click( function() {
    var data = getFormData(".registerView");

    alert( JSON.stringify(data) );

    // handle the request
    var jqhxr = $.post( "/register", function(data) {
      alert("success");
    })
    .done(function() {
      alert("second success");
    })
    .fail(function() {
      alert("error");
    })
    .always(function() {
      alert("finished");
    })
  });

}

switchToAnonView = function() {
  // get users list through api
  $.getJSON("/users", function( data ) {
    $.each( data, function( key, val) {
      console.log(val);
      var string = '<a href="#" class="list-group-item">'+val.name+'</a>';
      $(".userList").append( string );
    });

    $(".userList").show(slideTime
);
  });

  // get latest tweets through api
  $.getJSON("/latest", function( data ) {
    $.each( data, function( key, val) {
      console.log(val);
      var string = '<li class="media"> \
                      <a class="pull-left" href="#"> \
                        <img class="media-object" src="favicon.ico" alt="Favicon (Default)"> \
                      </a> \
                      <div class="media-body"> \
                        <h4 class="media-heading">'+val.from+'</h4> \
                        '+val.message+' \
                      </div> \
                    </li>';
      $(".tweetList").append( string );
    });

    $(".tweetList").show(slideTime
);
  });
}

switchToRegisterView = function() {
  switchTo(StateEnum.REG);
}

switchToLoginView = function() {
  switchTo(StateEnum.LOG);
}