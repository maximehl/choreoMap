function checkLogin(form){
  if(!form.username.value){
    window.alert("Please enter your username.");
    return false;
  }else if(!form.password.value){
    window.alert("Please enter your password.");
    return false;
  }
  return true;
}

function checkSignup(form){
  if(!form.username.value){
    window.alert("Please enter your username.");
    return false;
  }else if(!form.password.value){
    window.alert("Please enter your password.");
    return false;
  }else if(form.password.value!=form.passwordConfirm.value){
    window.alert("Your passwords do not match.");
    return false;
  }
  var usernameFree = false;
  $.ajax({
    url : '/checkUser?username=' + form.username.value,
    type : 'GET',
    async: false,
    success : function(data, status) {
      if(data.length===0){
        usernameFree = true;
      }
    },
    error: function() {
       alert("failed");
    }
  });
  if(!usernameFree){
    window.alert("This username is already taken.")
  }
  return usernameFree;
}

function searchChoreo(){
  var searchTerm = $("#searchTerm").val();
  if(searchTerm){
    $.get("/search?term=" + searchTerm, function(data){
      renderElements(data);
    });
  }else{
    $.get("/search", function(data){
      renderElements(data);
    });
  }
}

function renderElements(data){
  $("#choreoList").empty();
  if(data.length>0){
    $("#choreoList").append($("<h3>Your search returned these results:</h3>"));
    for(var i = 0; i<data.length; i++){
      var listObj = '<div><div class="inlineDiv"><a href="' + window.location.pathname + '?id=' + data[i].choreoName 
        + '"><div class="choreoObject divInsert">' + data[i].choreoName + '</div></a></div>'
        + '<div class="inlineDiv duplicateLink"><a class="plainlink" href="/duplicate?id=' + data[i].choreoName + '">Duplicate</a></div></div>';
      $(listObj).appendTo("#choreoList");
    }
  }else{
    $("#choreoList").append($("<h3>Your search returned no results!</h3>"));
  }
}