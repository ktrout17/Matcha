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
			<form action="includes/signup.inc.php" method="post">
				<input type="text" name="username" value="<?php if (isset($_GET['uid'])) echo $_GET['uid']; ?>" placeholder="Username"><br>
				<input type="email" name="email" value="<?php if (isset($_GET['mail'])) echo $_GET['mail']; ?>" placeholder="E-mail"><br>
				<input type="password" name="pwd" placeholder="Password"><br>
				<input type="password" name="pwd-repeat" placeholder="Confirm password"><br>
				<button type="submit" name="signup-submit">Signup</button>
			</form>
		</div>
	</div>
</main>