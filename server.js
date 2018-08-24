const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
//const bot = new TelegramBot(token, { polling: true });
const gor = require('./getOpenRankings.js');
const sf = require('./serviceFunctions.js');
const port = process.env.PORT || 443;
const host = '0.0.0.0';  // probably this change is not required
const externalUrl = process.env.CUSTOM_ENV_VARIABLE || 'https://fpa-tbot.herokuapp.com/';
const bot = new TelegramBot(token, { webHook: { port : port, host : host } });
bot.setWebHook(externalUrl + ':443/bot' + token);
let openState = {};
let openRankings = [];
let inputTextState = {};


console.log('Starting bot');

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  inputTextState.chatId = false;
  bot.sendDocument(msg.chat.id, 'https://media.giphy.com/media/uEoqvU7oPDpN6/giphy.gif',{caption: "Hi, I'm The Freestyle Frisbee Ranking Bot!   🏆🔴🏅\n\nPlease make your selection to get an official updated FPA ranking information. ↘️↘️↘️","reply_markup": {
      inline_keyboard: [[
              {
                text: 'Open Rankings',
                callback_data: 'GetOpenRankings'
              },{
                text: "Women's Rankings",
                callback_data: 'GetWomensRankings'
              }
            ],[{
                text: 'By Name',
                callback_data: 'GetPlayerRanking'
              }]]
    }});
  
});

bot.onText(/\/help/, (msg) => {
  const helpText = "Type 'Rank of' + a player's name to get his/her FPA open ranking information.";
  bot.sendMessage(msg.chat.id, helpText);

});

bot.on("callback_query", (callbackQuery) => {
  switch (callbackQuery.data) {
      
    case 'GetWomensRankings':{
      let botMsg = bot.sendMessage(callbackQuery.message.chat.id, "Getting Women's Rankings from FPA.com...\nPlease wait..." );
      bot.sendChatAction(callbackQuery.message.chat.id, 'typing');
      gor.getOpenRankings('womens').then(response => {
        bot.deleteMessage(callbackQuery.message.chat.id, botMsg._cancellationParent._rejectionHandler0.message_id);
        bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
        bot.sendChatAction(callbackQuery.message.chat.id, 'typing');
        bot.sendMessage(callbackQuery.message.chat.id, sf.sliceLongStr(response.str, response.arr, 0, -1),{
          "reply_markup": {
            inline_keyboard: [[
              {
                text: 'Open Rankings',
                callback_data: 'GetOpenRankings'
              },{
                text: "Women's Rankings",
                callback_data: 'GetWomensRankings'
              }
            ],[{
                text: 'By Name',
                callback_data: 'GetPlayerRanking'
              }]]
          }
        });
      });
      break;
    };
      
    case 'GetOpenRankings': {
      let botMsg = bot.sendMessage(callbackQuery.message.chat.id, "Getting Open Rankings from FPA.com...\nPlease wait..." );
      bot.sendChatAction(callbackQuery.message.chat.id, 'typing');
      const chatID = callbackQuery.message.chat.id;
      openState.chatID = 0;
      //console.log(openState.get(msg.chat.id));
      gor.getOpenRankings().then(response => {
        openRankings[0] = sf.sliceLongStr(response.str, response.arr, 0, 100);
        openRankings[1] = sf.sliceLongStr(response.str, response.arr, 100, 200);
        openRankings[2] = sf.sliceLongStr(response.str, response.arr, 200, 300);
        openRankings[3] = sf.sliceLongStr(response.str, response.arr, 300, 400);
        openRankings[4] = sf.sliceLongStr(response.str, response.arr, 400, -1);
        bot.deleteMessage(callbackQuery.message.chat.id, botMsg._cancellationParent._rejectionHandler0.message_id);
        bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
        bot.sendChatAction(callbackQuery.message.chat.id, 'typing');
        bot.sendMessage(callbackQuery.message.chat.id, openRankings[0], {
          "reply_markup": {
            inline_keyboard: [[
              {
                text: '',
                callback_data: 'GetOpenRankings'
              },{
                text: "Next page ⏩",
                callback_data: 'NextOpenRankings'
              }
            ],[{
                text: '🔄 Start Over 🔄',
                callback_data: 'StartOver'
              }]]
          }
        });
      });
      break;
    };
      
    case 'NextOpenRankings': {
      bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
      const chatID = callbackQuery.message.chat.id;
      openState.chatID = openState.chatID + 1;
      bot.sendMessage(callbackQuery.message.chat.id, openRankings[openState.chatID], {
          "reply_markup": {
            inline_keyboard: [[
              {
                text: openState.chatID > 0 ? '⏪ Previouse Page' : '',
                callback_data: 'PrevOpenRankings'
              },{
                text: openState.chatID < 4 ? "Next Page ⏩" : '',
                callback_data: 'NextOpenRankings'
              }
            ],[{
                text: '🔄 Start Over 🔄',
                callback_data: 'StartOver'
              }]]
          }
        });
      break;
    };
    
    case 'PrevOpenRankings': {
      bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
      const chatID = callbackQuery.message.chat.id;
      openState.chatID = openState.chatID - 1;
      bot.sendMessage(callbackQuery.message.chat.id, openRankings[openState.chatID], {
          "reply_markup": {
            inline_keyboard: [[
              {
                text: openState.chatID > 0 ? '⏪ Previouse Page' : '',
                callback_data: 'PrevOpenRankings'
              },{
                text: openState.chatID < 4 ? "Next page ⏩" : '',
                callback_data: 'NextOpenRankings'
              }
            ],[{
                text: '🔄 Start Over 🔄',
                callback_data: 'StartOver'
              }]]
          }
        });
      break;
    };
      
    case 'GetPlayerRanking': {
      const chatId = callbackQuery.message.chat.id;
      inputTextState.chatId = true;
      bot.sendMessage(callbackQuery.message.chat.id, "Type in a player's name and hit send.", {"reply_markup": {
      "force_reply": true
      }});
      break;
    };
      
    case 'StartOver': {
      bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
      bot.sendDocument(callbackQuery.message.chat.id, 'https://media.giphy.com/media/uEoqvU7oPDpN6/giphy.gif',{caption: "Hi, I'm The Freestyle Frisbee Ranking Bot!   🏆🔴🏅\n\nPlease make your selection to get an official updated FPA ranking information. ↘️↘️↘️","reply_markup": {
      inline_keyboard: [[
              {
                text: 'Open Rankings',
                callback_data: 'GetOpenRankings'
              },{
                text: "Women's Rankings",
                callback_data: 'GetWomensRankings'
              }
            ],[{
                text: 'By Name',
                callback_data: 'GetPlayerRanking'
              }]]
      }});
      break;
    };
      
  };
});

bot.on('message', (msg) => {
  let operator;
  var Hello = "hello";
  if (msg.text.toString().toLowerCase().indexOf(Hello) === 0) {
    operator = Hello;
  }
  
  switch (operator) {
      
    //case Hello: {}
      
    default: {
      const chatId = msg.chat.id; 
      if (inputTextState.chatId){
      let botMsg = bot.sendMessage(msg.chat.id, 'Getting Open Rankings on FPA.com...');
        bot.sendChatAction(msg.chat.id, 'typing');
      gor.getOpenRankings().then(response => {
        //bot.sendMessage(msg.chat.id, response.str.slice(0,300));
        bot.sendChatAction(msg.chat.id, 'typing');
        const in_name = msg.text.toString().toLowerCase().replace(/,/g, '').split(' ');
        console.log(in_name);
        let index = -1;
        for (let i = 0; i < response.arr.length; i++) {
          if ((response.arr[i][2].toLowerCase().includes(in_name[0])) && (response.arr[i][2].toLowerCase().includes(in_name[1]))) {
            index = i;
            inputTextState.chatId = false;
            break;
          }
          else if ((in_name.length == 1) && (response.arr[i][2].toLowerCase().includes(in_name[0]))) {
            console.log('im in the else if');
            index = i;
            inputTextState.chatId = false;
            break;
          };
        };
        if (index != -1) {
          console.log(response.arr[index]);
          const palyer = 'Current: ' + response.arr[index][0] + 'Previouse: ' + response.arr[index][1] + 'Name: ' + response.arr[index][2] + 'Country: ' + response.arr[index][3] + 'Gender: ' + response.arr[index][4] + 'Best 8 results: ' + response.arr[index][5] + '# of events: ' + response.arr[index][6];
          bot.sendChatAction(msg.chat.id, 'typing');
          bot.deleteMessage(msg.chat.id, botMsg._cancellationParent._rejectionHandler0.message_id);
          bot.sendMessage(msg.chat.id, palyer, {
          "reply_markup": {
            inline_keyboard: [[
              {
                text: 'Open Rankings',
                callback_data: 'GetOpenRankings'
              },{
                text: "Women's Rankings",
                callback_data: 'GetWomensRankings'
              }
            ],[{
                text: 'By Name',
                callback_data: 'GetPlayerRanking'
              }]]
          }
        });
          inputTextState.chatId = false;
        }
        else {
          bot.sendChatAction(msg.chat.id, 'typing');
          bot.deleteMessage(msg.chat.id, botMsg._cancellationParent._rejectionHandler0.message_id);
          bot.sendMessage(msg.chat.id, 'Can not find player named: ' + msg.text.toString());
          inputTextState.chatId = false;
        };
      });
      inputTextState.chatId = false;
      break;
    };
    };
  }

});

/*
bot.onText(/\/back/, (msg) => {
  bot.sendMessage(msg.chat.id, "Please make your selection", {
    "reply_markup": {
      "keyboard": [["/open rankings", "/women's rankings"], ["/help"]]
    }
  });
});
*/
/*
bot.onText(/\/next/, (msg) => {
  //bot.sendMessage(msg.chat.id, 'Getting Open Rankings on FPA.com...');
  let chatID = msg.chat.id;
  openState.chatID = openState.chatID < 5 ? (openState.chatID + 1) : 1;
  const s_id = openState.chatID - 1;
  console.log(openState.chatID);
  gor.getOpenRankings().then(response => {
    console.log(s_id != 4 ? (s_id + 1) * 100 : response.arr.length);
    bot.sendMessage(msg.chat.id, sf.sliceLongStr(response.str, response.arr, (s_id) * 100, s_id != 4 ? (s_id + 1) * 100 : -1), {
      "reply_markup": {
        //"keyboard": [["/next 100", "/back"], ["/help"]],
        inline_keyboard: [[
        {
          text: 'Development',
          callback_data: 'development'
        },{
          text: 'Music',
          callback_data: 'music'
        },{
          text: 'Cute monkeys',
          callback_data: 'cute-monkeys'
        }
      ]]
      }
    });
  });
});
*/
/*
bot.onText(/\/women's rankings/, (msg) => {
  bot.sendMessage(msg.chat.id, "Getting Women's Rankings from FPA.com...\nPlease wait...");

  gor.getOpenRankings('womens').then(response => {
    bot.sendMessage(msg.chat.id, sf.sliceLongStr(response.str, response.arr, 0, -1));
  });
});
*/

