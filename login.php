<?php
    require "header.php";
    ?>

<html>
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<body class="text-center">
    <form class="form-signin" action="login.inc.php" method="post">
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <img class="mb-4" src="img/logoo-cropped.png" alt width="90" height="72">
        <h1 class="h3 mb-3 font-weight-normal">Please Sign-In Below</h1>
        <label for="inputEmail" class="sr-only">Email Address</label>
        <input type="email" id="inputEmail" class="form-control" placeholder="Email Address" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" required>
        <div class="checkbox mb-3">
            <label>
                <input type="checkbox" value="remember-me">
                Remember Me
            </label>
        </div>
        <button class="btn btn-lg btn-danger btn-block" type="submit">Sign-In</button>
        <p class="mt-5 mb-3 text-muted">© 2019</p>
    </form>
</body>
</html>

<?php
require "footer.php";
?>
