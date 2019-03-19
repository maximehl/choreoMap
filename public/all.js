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
