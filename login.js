$(document).ready(function(){
    $("#loginForm").validate({
        rules:{
            email:{
                required:true,
                email:true
            },
            password:{
                required:true,
            }
            
        },
        messages:{
            email:"Invalid Email",
            password:"Invalid Password"
        },
        submitHandler: function(form){
            let email = $("#email").val();
            let password = $("#password").val();

            let users = JSON.parse(localStorage.getItem("users")) || [];

            let validUser = users.find(user=>
                user.email === email && user.password === password
            );

            if(validUser){
                $(".status-msg")
                .text("Login Successfull")
                .css("color","green")
                .fadeIn();

                setTimeout(function(){
                    window.location.href= "dashboard.html";
                },2000)
            }
            else{
    
                $(".status-msg")
                    .text("Invalid Email or Password")
                    .css("color","red")
                    .fadeIn();

                setTimeout(function(){
                    $(".status-msg").fadeOut();
                }, 3000);

                $("#email, #password").addClass("error");

            }
        }
    })
})