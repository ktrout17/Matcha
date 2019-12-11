<?php
    require "header.php";
?>

<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="style/style.css">
    </head>
    <body>
    <main role="main">
    <div id="myCarousel" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
            <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
            <li data-target="#myCarousel" data-slide-to="1"></li>
            <li data-target="#myCarousel" data-slide-to="2"></li>
            <li data-target="#myCarousel" data-slide-to="3"></li>
            <li data-target="#myCarousel" data-slide-to="4"></li>
            <li data-target="#myCarousel" data-slide-to="5"></li>
            <li data-target="#myCarousel" data-slide-to="6"></li>
        </ol>
        <div class="carousel-inner">
            <div class="carousel-item active" data-interval="5000">
                <img src="img/coffeecouple.jpg" class="d-block w-100">
                <div class="container">
                    <div class="carousel-caption text-left">
                        <h1>Are You Looking For Love?</h1>
                        <p>Matcha is the place for you.</p>
                        <p>
                            <a class="btn btn-lg btn-danger" href="signup.php" role="button">Join Us Today!</a>
                        </p>
                    </div>
                </div>
            </div>
            <div class="carousel-item" data-interval="5000">
                <img src="img/couple4.jpg" class="d-block w-100">
                <div class="container"></div>
            </div>
            <div class="carousel-item" data-interval="5000">
                <img src="img/couple6.jpg" class="d-block w-100">
                <div class="container"></div>
            </div>
            <div class="carousel-item" data-interval="5000">
                <img src="img/couple8.jpg" class="d-block w-100">
                <div class="container"></div>
            </div>
            <div class="carousel-item" data-interval="5000">
                <img src="img/couple9.jpg" class="d-block w-100">
                <div class="container"></div>
            </div>
            <div class="carousel-item" data-interval="5000">
                <img src="img/couple10.jpg" class="d-block w-100">
                <div class="container"></div>
            </div>
            <div class="carousel-item" data-interval="5000">
                <img src="img/couple5.jpg" class="d-block w-100">
                <div class="container">
                    <div class="carousel-caption">
                        <h1>Already Have An Account?</h1>
                        <p>See What You've Missed While You've Been Away.</p>
                        <p>
                            <a class="btn btn-lg btn-danger" href="login.php" role="button">Sign-In Here!</a>
                        </p>
                    </div>
                </div>
            </div>
            ::after
        </div>
        <a class="carousel-control-prev" href="#myCarousel" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#myCarousel" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>
    <br>
    <br>
    <br>
    <br>
    <div class="container-marketing">
        <div class="row">
            <div class="col-lg-4">
                <img class="rounded-circle" src="img/rec1.jpg" alt="rec1" width="140" height="140">
                <h2>Tyler & Mish</h2>
                <p>Matcha is awesome! We connected instantly and have been together ever since.</p>
            </div>
            <div class="col-lg-4">
                <img class="rounded-circle" src="img/rec2.jpg" alt="rec1" width="140" height="140">
                <h2>Nathan & Tanya</h2>
                <p>Matcha is awesome! We connected instantly and have been together ever since.</p>
            </div>
            <div class="col-lg-4">
                <img class="rounded-circle" src="img/rec3.jpg" alt="rec1" width="140" height="140">
                <h2>Andrew & Sam</h2>
                <p>Matcha is awesome! We connected instantly and have been together ever since.</p>
            </div>
        </div>
    </div>
    </main>
    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <script src="style/js/bootstrap.bundle.js"></script>
    <script src="style/js/bootstrap.js"></script>
    </body> 
</html>
<?php
    require "footer.php";
?>
