$(document).ready(function(){  
//? no need to do preventDefault,this validation does this internally
    $.validator.addMethod("customPassword",function(value,element){
        let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return this.optional(element) || passwordPattern.test(value);
    },"Enter Valid Password")


    $("#registerForm").validate({
        rules:{
            email:{
                required:true,
                email:true
            },
            password:{
                required:true,
                customPassword:true
            },
            cpassword:{
                required:true,
                minlength:6,
                equalTo:"#password"
            }
        },
        messages:{
            email : "Please enter a valid email",
            password : {
                required :"Please provide a password",
                minlength : "Your password must be atleast 6 charcters long"
            },
            cpassword : {
                required : "Please provide a password",
                minlength : "Your password must be atleast 6 charcters long",
                equalTo : "Please enter the same password as above"
            }
        },
        submitHandler: function(form){
            let email = $("#email").val();
            let password = $("#password").val();

            let users = JSON.parse(localStorage.getItem("users")) || [];

            let exists = users.some(user=> user.email === email);

            if(exists){
                
            $(".status-msg")
            .stop(true, true)
            .text("User already exists")
            .css("color","red")
            .fadeIn();
            $("#email").addClass("error");

             setTimeout(() => {
             $(".status-msg").fadeOut();
             $("#email").removeClass("error");
            }, 3000);

            return;

            }
            users.push({
                email :email,
                password : password
            });

            localStorage.setItem("users",JSON.stringify(users));

            $(".status-msg")
            .text("Registered Successfully").css("color","green");

            setTimeout(function(){
                  window.location.href = "login.html";
            },2000);

          
        }
    })
})
