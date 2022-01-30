# Slaugh-webgame-frontend
This repository is for the Front-End of Slaugh Webgame (deploy soon ! ). 

## What is Slaugh??
This game is a card game that players will take turn to place the card on the deck and try to get rid of their cards as fast as possible. You can only place card that has more value than the card in the deck. The first player to win is the King. The second player to in win is the Queen. The last player is Slave and next to last is High slave. Then, at start of the next round, King will exchange 2 cards with slave and Queen will exchange 1 card with high slave (slave and high slave will always exchange the most valuable cards). Then the game goes on. Remember! Any player can become king, queen or slave by the end of the each turn! So try to win as fast as possible and 

## Building Front-End
- Javascript and React.js for building all the components and logic about the game
- Socket.io to connect with the server
- react-beautiful-dnd for dragging and placing cards
- react-router-dom for changing routes 

## Mainmenu
This is the first page of the game which is the Main Menu

![image](https://user-images.githubusercontent.com/71002659/151709816-277c1c86-1c1c-4580-a419-a925a68bf708.png)

Firstly, player needs to enter his username. Then, If player clicks host game, player will be moved to Lobby with random room id. But if player clicks join game, player need to enter room id then player will be moved to that specific lobby. 

When player click join game
![image](https://user-images.githubusercontent.com/71002659/151710165-dc66b874-2d37-4779-a194-e78357566cde.png)

if player didn't enter a valid username or valid room id, game will alert the player.
![image](https://user-images.githubusercontent.com/71002659/151710241-d57cef61-d302-4db4-b927-d16a431154c1.png)

## Lobby
This is the waiting room for players with the same room id. Host can change the time limit for each turn and is the one to start the game ( only when 4 players are in the room). 

## In Game
### Preparing Stage
Players will take a look at their cards and could change the order of the cards. Player can't play any card yet.

### Playing Stage
Player will take turn to either play the card or pass the turn. Player can only play card that has more value than the last played card. If time's up, current turn's player will automatically pass that turn. If everybody pass except the player who play the last card, the pile will reset and that player will be the first to play. 

### Round End Stage
When the round ends, players will be notify what status they get and host can either start the next round or go back to lobby to get new player to join the room ( if other players disconnect).
