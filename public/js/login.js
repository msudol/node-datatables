$(document).ready(function(){
    var user,pass;

    $("body").on("submit", '#form-signin', function(event) { 
        event.preventDefault();
        $("#loginStatus").html("<p> &nbsp; </p>")
        
        user=$("#username").val();
        pass=$("#password").val();
        //TODO: inheret the actual server address
        $.post("/client/login", {username: user, password: pass}, function(data) {
            //TODO: need to do something better than this
            console.log(data);
            if (typeof data.redirect == 'string') {
                window.location = data.redirect;
            } else {            
                $("#loginStatus").html("<p>" + data + "</p>");
            } 
        });
    });
});