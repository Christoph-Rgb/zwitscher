# zwitscher

Twitter remake for MW

## API

### Users:

GET /api/users = returns all users

GET /api/users/{id} = return specified user

POST /api/users = creates user from payload

POST /api/users/authenticate = authenticates user from payload

POST /api/users/{id}/follow = adds user id to following list

POST /api/users/{id}/unfollow = removes user id from following list

POST /api/users/{id}/update = updates the user with id from payload

DELETE /api/users/{id} = deletes specified user

DELETE /api/users = deletes all users



### Tweets:

GET /api/tweets/{id} = returns specified tweet

GET /api/tweets = returns all tweets

GET /api/tweets/users/{id} = returns all tweets for user

GET /api/users/{id}/tweets = returns all tweets by user

POST /api/tweets = posts a tweet from payload

DELETE /api/tweets = deletes all tweets

DELETE /api/tweets/{id} = deletes specified tweet

### Jobs:

POST /api/deleteTweetsJob/{tweetsToDelete} = deletes all specified tweets (JSON Array of Tweet IDs)

POST /api/deleteUsersJob/{usersToDelete} = deletes all specified users (JSON Array of User IDs)