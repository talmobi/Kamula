// adds dynamic jquery functionality to the client side page

hideAllViews = function() {
  $(".myView").hide();
}

switchToHomeView = function() {
  hideAllViews();
  $(".anonView").show();
}

// initialize jquery API funcitonality
// for buttons etc
init = function() {

  
  $(".loginButton").click( function() {
      alert("sent");

    var jqhxr = $.post( "/register", function() {
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

    $(".userList").show(1000);
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

    $(".tweetList").show(1000);
  });
}

switchToRegisterView = function() {
  hideAllViews();
  $(".registerView").show();
}

switchToLoginView = function() {
  hideAllViews();
  $(".loginView").show();
}