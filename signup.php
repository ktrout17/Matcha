<?php
    require "style/header.php";
?>
<main>
		<?php
			if (isset($_GET['error'])) {
				if ($_GET['error'] == "emptyfields") {
					echo '<p>Fill in all fields</p>';
				} else if ($_GET['error'] == "invalidmailuid") {
					echo '<p>Invalid username & password</p>';
				}
				else if ($_GET['error'] == "invalidmail") {
					echo '<p>Invalid email</p>';
				}
				else if ($_GET['error'] == "invaliduid") {
					echo '<p>Invalid username</p>';
				}
				else if ($_GET['error'] == "passwordcheck") {
					echo '<p>Passwords doesn\'t match</p>';
				} else if ($_GET['error'] == "mailtaken") {
					echo '<p>Email already registered</p>';
				}
				else if ($_GET['error'] == "pwdshort") {
					echo '<p>Password needs to be longer than 8 characters</p>';
				}  else if ($_GET['error'] == "pwdnocap") {
					echo '<p>Password needs at least 1 uppercase letter</p>';
				}  else if ($_GET['error'] == "pwdnolow") {
					echo '<p>Password needs at least 1 lowercase letter</p>';
				}  else if ($_GET['error'] == "pwdnospchar") {
					echo '<p>Password needs at least 1 special character</p>';
				}  else if ($_GET['error'] == "pwdnodigit") {
					echo '<p>Password needs at least 1 digit</p>';
				}  else if ($_GET['error'] == "pwdspace") {
					echo '<p>Password should have no spaces</p>';
				}
			}
			?>
			<div class="container">
                <form action="includes/signup.inc.php" method="post">
                    <div class="form-group row">
                        <label for="inputusername" class="col-sm-2 col-form-label">Username</label>
                        <div class="col-sm-10">
                            <input type="text" name="username" value="<?php if (isset($_GET['uid'])) echo $_GET['uid']; ?>" placeholder="Username"><br>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="inputfirstname" class="col-sm-2 col-form-label">First Name</label>
                        <div class="col-sm-10">
                            <input type="text" name="firstname" value="<?php if (isset($_GET['uid'])) echo $_GET['uid']; ?>" placeholder="First Name"><br>
                        </div>
                    </div>
				    <div class="form-group row">
                        <label for="inputlastname" class="col-sm-2 col-form-label">Last Name</label>
                        <div class="col-sm-10">
                            <input type="text" name="lastname" value="<?php if (isset($_GET['uid'])) echo $_GET['uid']; ?>" placeholder="Last Name"><br>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="inputEmail3" class="col-sm-2 col-form-label">Email</label>
                        <div class="col-sm-10">
                            <input type="email" name="email" value="<?php if (isset($_GET['mail'])) echo $_GET['mail']; ?>" placeholder="E-mail"><br>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="inputPassword3" class="col-sm-2 col-form-label">Password</label>
                        <div class="col-sm-10">
                            <input type="password" name="pwd" placeholder="Password"><br>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="inputPassword3" class="col-sm-2 col-form-label">Repeat Password</label>
                        <div class="col-sm-10">
                            <input type="password" name="pwd-repeat" placeholder="Confirm password"><br>
                        </div>
                    </div>
                    <div class="form-group row">
                        <div class="col-sm-10">
                            <button class="btn btn-danger" type="submit" name="signup-submit">Sign-Up</button>
                        </div>
                    </div>
			    </form>
		    </div>

</main>

<?php
    require "style/footer.php";
?>