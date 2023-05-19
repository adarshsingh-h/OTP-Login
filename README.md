# OTP-Login

## Routes Used

### Generate OTP
User will send his email address (which also acts as the login id) in the request body
backend will generate an OTP and send it back to the user provided certain conditions are met. The conditions that need to be met are listed below. 


### Login API
User will send his email address and OTP in the request body
If OTP is valid then generate a new JWT token and send it back to the user


### Important Conditions that are handled:
1. OTP once used can not be reused
2. OTP is valid for 5 minutes only. Not after that.
3. 5 consecutive wrong OTP will block the user account for 1 hour. The login can be reattempted only after an hour.
4. There should be a minimum 1 min gap between two generate OTP requests. 
