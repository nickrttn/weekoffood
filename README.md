# Week of Food

Week of Food connects to the Trello API. It retrieves one of your boards, on which there should be recipes. You can sort and filter, and eventually, randomize 5 of them, which will be added to your recipes for that week. Meal planning should be 0 effort.

## Installation

**Requirements**

- Node.js v5.1
- MongoDB v3.2

1. `git clone https://github.com/nickrttn/weekoffood && cd weekoffood`
2. Copy `config/config.js.example` to `config/config.js`.
3. Set up the application in `config/config.js`.
4. `npm install && bower install`
5. `npm start`
6. You'll be able to visit the application at `http://localhost:3000`.

## To do

- Parse the recipes' markdown to generate a shopping list for the whole week.
- Email a recipe to the users' inbox daily, around a pre-set dinner time.
- Send a reminder to make a new weekly menu.
- Make it work with a demonstration board: zero state, baby.
- Do it all over in MeteorJS as prep for Responsive Web minor.
- DRY it out.
