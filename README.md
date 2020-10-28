# 3HandPokerAPI

Set of API's to be paired with 3 Hand Poker App. 

Using Node Js and Express, with a database(Mongo DB), this was deployed to Google Cloud seperate from the 3 Hand Poker App. 

API's are mostly POST and GET method types accepting json input in order to either get information about the current game at hand or to update the DB with the latest changes that took place in the game(someone folded, someone bet etc). There is game logic in place to determine not only the winner, but also who's turn.  


3rd Party Services Used: 

MongoDB - Database Service(Have one free instance running in the cloud)
Pusher - Realtime Push Notification Service(Have a free instance running with limitations sent on number of messages that can be sent). 
Google Cloud - Used to Deploy this Express App to the cloud for accessibility. 
