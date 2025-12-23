_login_attempts = {}

def getUser(username):
    users = {
        "admin": {
            "username": "admin",
            "password": "admin123",  
            "role": "admin"
        },
        "user": {
            "username": "user",
            "password": "user123",
            "role": "user"
        }
    }

    return users.get(username)


def recordLoginAttempt(username, success):
    attempts = _login_attempts.get(username, 0)
    _login_attempts[username] = attempts + 1

    return {
        "username": username,
        "attempts": _login_attempts[username],
        "success": success,
    }
