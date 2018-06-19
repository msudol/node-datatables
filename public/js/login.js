$(document).ready(function(){
    var user,pass;

    $("body").on("submit", '#form-signin', function(event) { 
        event.preventDefault();
        user=$("#username").val();
        pass=$("#password").val();
        //TODO: inheret the actual server address
        $.post("http://localhost:3000/client/login", {username: user,password: pass}, function(data) {
            //TODO: need to do something better than this
            alert(data);
        });
    });
});