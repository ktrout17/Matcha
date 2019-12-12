<?php
require "header.php";
?>

<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script><link rel="stylesheet" href="style/style.css">
        <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    </head>
    <hr>
<div class="container bootstrap snippet">
    <div class="row">
        <div class="col-sm-10"><h1>Username</h1></div>
        <div class="col-sm-2"><a href="/users" class="pull-right"><img title="profile image" src="img/logoo-cropped.png"></a> </div>
    </div>
    <div class="row">
        <div class="col-sm-3">
            <div class="text-center">
                <img src="http://ssl.gstatic.com/accounts/ui/avatar_2x.png" class="avatar img-circle img-thumbnail" alt="avatar">
                <h6>Upload New Profile Image</h6>
                <input type="file" class="text-center center-block file-upload">
            </div><hr/><br>
            <div class="panel panel-default">
                <div class="panel-heading">Website<i class="fa fa-link fa-1x"></i></div>
                <div class="panel-body"><a href="#">blahblahblah.com</a></div>
            </div>
            <ul class="list-group">
                <li class="list-group-item text-muted">Activity<i class="fa fa-dashboard fa-1x"></i></li>
                <li class="list-group-item text-right"><span class="pull-left"><strong>Likes</strong></span>50</li>
                <li class="list-group-item text-right"><span class="pull-left"><strong>Views</strong></span>100</li>
            </ul>
            <div class="panel panel-default">
                <div class="panel-heading">Social Media</div>
                <div class="panel-body">
                    <i class="fa fa-facebook fa-2x"></i> <i class="fa fa-twitter fa-2x"></i> <i class="fa fa-google-plus fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-sm-9">
            <ul class="nav nav-tabs">
                <li class="active"><a data-toggle="tab" href="#home">Home</a> </li>
                <li><a data-toggle="tab" href="#messages">Messages</a> </li>
                <li><a data-toggle="tab" href="#settings">Settings</a> </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane active" id="home">
                    <hr>
                    <form class="form" action="##" method="post" id="registrationForm">
                        <div class="form-group">
                            <div class="col-xs-6">
                                <label for="first_name"><h4>First Name</h4></label>
                                <input type="text" class="form-control" name="first_name" id="first_name" placeholder="First Name">
                            </div>
                            <div class="col-xs-6">
                                <label for="first_name"><h4>Last Name</h4></label>
                                <input type="text" class="form-control" name="last_name" id="last_name" placeholder="Last Name">
                            </div>
                            <div class="col-xs-6">
                                <label for="first_name"><h4>Email</h4></label>
                                <input type="text" class="form-control" name="email" id="email" placeholder="Email">
                            </div>
                            <div class="col-xs-6">
                                <label for="first_name"><h4>Location</h4></label>
                                <input type="text" class="form-control" name="location" id="location" placeholder="Location">
                            </div>
                            <div class="col-xs-6">
                                <label for="first_name"><h4>Password</h4></label>
                                <input type="text" class="form-control" name="password" id="password" placeholder="Password">
                            </div>
                            <div class="col-xs-6">
                                <label for="first_name"><h4>Verify Password</h4></label>
                                <input type="text" class="form-control" name="verify" id="verify" placeholder="Verify Password">
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
</html>

<?php
require "footer.php";
?>