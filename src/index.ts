import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
const token = process.env.ACCESS_TOKEN_BOT_TELE || '';
const bot = new TelegramBot(token, { polling: true });
var projectId = '';
var memberId = '';
bot.onText(/^\/update-bot$/, (msg) => {
  console.log(msg);
  axios
    .get(
      `${process.env.API_TELEGRAM_URL}${process.env.ACCESS_TOKEN_BOT_TELE}/getUpdates`
    )
    .then((res) => {
      bot.sendMessage(msg.chat.id, 'update bot to group successfully');
    })
    .catch((err) => console.log(err.message));
});

bot.onText(/^\/create-project /, (msg) => {
  let mess = '';
  let nameProject = '';
  let msgText = msg.text;
  if (msgText && msgText.split(' ').length == 2) {
    nameProject = msgText.split(' ')[1];
  } else {
    mess = 'Your input not valid';
  }
  if (mess) {
    bot.sendMessage(msg.chat.id, mess);
  } else {
    axios
      .post(
        `${process.env.API_GITLAB_URL}/projects?name=${nameProject}&namespace_id=${process.env.ID_GROUP}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
          },
        }
      )
      .then((res) => {
        bot.sendMessage(msg.chat.id, 'create project successfully');
      })
      .catch((err) => {
        if (
          err.status === 400 &&
          err.message?.name === 'has already been taken'
        ) {
          bot.sendMessage(msg.chat.id, 'Project name already been taken');
        } else {
          console.log(err.message);
        }
      });
  }
});

bot.onText(/^\/list-projects$/, (msg) => {
  axios
    .get(
      `${process.env.API_GITLAB_URL}/groups/${process.env.ID_GROUP}/projects`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
        },
      }
    )
    .then((res) => {
      let mess = '';
      let i = 0;
      for (let item of res.data) {
        mess += `Project ${item.id}: ` + item.name + '\n';
        i++;
      }
      bot.sendMessage(msg.chat.id, mess);
    })
    .catch((err) => console.log(err.message));
});

bot.onText(/^\/list-member-group$/, (msg) => {
  axios
    .get(
      `${process.env.API_GITLAB_URL}/groups/${process.env.ID_GROUP}/members`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
        },
      }
    )
    .then((res) => {
      let mess = '';
      let i = 0;
      mess += `Member of group ${process.env.ID_GROUP}\n`;
      for (let item of res.data) {
        mess += `Member ${item.id}: ` + item.name + '\n';
        i++;
      }
      bot.sendMessage(msg.chat.id, mess);
    })
    .catch((err) => console.log(err.message));
});

bot.onText(/^\/list-member-project /, (msg) => {
  let mess = '';
  let idProject = '';
  let msgText = msg.text;
  if (msgText && msgText.split(' ').length == 2) {
    idProject = msgText.split(' ')[1];
  } else {
    mess = 'Your input not valid';
  }
  if (mess) {
    bot.sendMessage(msg.chat.id, mess);
  } else {
    axios
      .get(
        `${process.env.API_GITLAB_URL}/projects/${idProject}/members`,

        {
          headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
          },
        }
      )
      .then((res) => {
        let responseTelegram = '';
        let i = 0;
        responseTelegram += `Member of project ${idProject}\n`;
        for (let item of res.data) {
          responseTelegram += `Member ${item.id}: ` + item.name + '\n';
          i++;
        }
        bot.sendMessage(msg.chat.id, responseTelegram);
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(msg.chat.id, err.message);
      });
  }
});

bot.onText(/^\/add-member-project /, (msg) => {
  let mess = '';
  let idProject = '';
  let idMember = '';
  let msgText = msg.text;
  if (msgText && msgText.split(' ').length == 3) {
    idProject = msgText.split(' ')[1];
    idMember = msgText.split(' ')[2];
  } else {
    mess = 'Your input not valid';
  }
  if (mess) {
    bot.sendMessage(msg.chat.id, mess);
  } else {
    axios
      .post(
        `${process.env.API_GITLAB_URL}/projects/${idProject}/members`,
        {
          user_id: idMember,
          access_level: 30,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
          },
        }
      )
      .then((res) => {
        let responseTelegram = `add member ${idMember} to project ${idProject} successfully`;
        bot.sendMessage(msg.chat.id, responseTelegram);
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(msg.chat.id, err.message);
      });
  }
});

// bot.onText(/^\/list$/, (msg) => {
//   axios
//     .get(
//       `${process.env.API_GITLAB_URL}groups/${process.env.ID_GROUP}/projects`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
//         },
//       }
//     )
//     .then((res) => {
//       let mess = '';
//       for (const txt of res.data) {
//         mess += `${txt.id} - ${txt.name} \n`;
//       }
//       bot.sendMessage(msg.chat.id, 'Choose your project', {
//         reply_markup: {
//           inline_keyboard: [
//             [
//               {
//                 text: 'Yes',
//                 callback_data: 'A1',
//               },
//               {
//                 text: 'No',
//                 callback_data: 'A2',
//               },
//             ],
//           ],
//         },
//       });
//     })
//     .catch((err) => console.log(err.message));
// });

// bot.onText(/^\/add/-/d+/-/w+$/, (msg) => {
//     axios
//     .get("https://gitlab.com/api/v4/project/32198756/boards", {
//       headers: {
//         Authorization: "Bearer glpat-yCGSw2AkVyDtWERHy-4z",
//       },
//     })
//     .then((res) => {
//       bot.sendMessage(msg.chat.id, 'Success');
//     })
//     .catch((err) => console.log(err.message));
// })

// Matches /photo
// bot.onText(/\/photo/, function onPhotoText(msg) {
//   // From file path
//   const photo = `${__dirname}/../test/data/photo.gif`;
//   bot.sendPhoto(msg.chat.id, photo, {
//     caption: "I'm a bot!",
//   });
// });

// // Matches /audio
// bot.onText(/\/audio/, function onAudioText(msg) {
//   // From HTTP request
//   const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
//   const audio = request(url);
//   bot.sendAudio(msg.chat.id, audio);
// });

// // Matches /love

// // Matches /echo [whatever]
// bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
//   const resp = match[1];
//   bot.sendMessage(msg.chat.id, resp);
// });

// // Matches /editable
// bot.onText(/\/editable/, function onEditableText(msg) {
//   const opts = {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           {
//             text: 'Edit Text',
//             // we shall check for this value when we listen
//             // for "callback_query"
//             callback_data: 'edit',
//           },
//         ],
//       ],
//     },
//   };
//   bot.sendMessage(msg.from.id, 'Original Text', opts);
// });

// pin messages
// bot.onText(/\/add-issue-pin-message/, function onTextHandler(msg) {
//   const opts = {
//     reply_to_message_id: msg.message_id,
//     reply_markup: JSON.stringify({
//       keyboard: [
//         ['Yes, you are the bot of my life ❤'],
//         ['No, sorry there is another one...'],
//       ],
//     }),
//   };
//   //@ts-ignore
//   bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
// });

bot.onText(/\/list-project-issues /, (msg) => {
  let mess = '';
  let idProject = '';
  let msgText = msg.text;
  if (msgText && msgText.split(' ').length == 2) {
    idProject = msgText.split(' ')[1];
  } else {
    mess = 'Your input not valid';
  }
  if (mess) {
    bot.sendMessage(msg.chat.id, mess);
  } else {
    axios
      .get(`${process.env.API_GITLAB_URL}/projects/${idProject}/issues`, {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
        },
      })
      .then((res) => {
        let responseTelegram = `List issue of project ${idProject}:\n`;
        for (let item of res.data) {
          responseTelegram += `Issue ${item.id}: ${item.title}`;
        }

        bot.sendMessage(msg.chat.id, responseTelegram);
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(msg.chat.id, err.message);
      });
  }
});
// bot.onText(/\/add-issue /, (msg) => {
//   console.log("Hello")
//   let mess = '';
//   let idProject = '';
//   let issueStr = '';
//   let msgText = msg.text;
//   if (msgText && msgText.split(' ').length == 3) {
//     idProject = msgText.split(' ')[1];
//     issueStr = msgText.split(' ')[2];
//   } else {
//     mess = 'Your input not valid';
//   }
//   if (mess) {
//     bot.sendMessage(msg.chat.id, mess);
//   } else {
//     axios
//       .post(
//         `${process.env.API_GITLAB_URL}/projects/${idProject}/issues`,
//         {
//           title: issueStr,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
//           },
//         }
//       )
//       .then((res) => {
//         let responseTelegram = `add issue ${issueStr} to project ${idProject} successfully`;
//         bot.sendMessage(msg.chat.id, responseTelegram);
//       })
//       .catch((err) => {
//         console.log(err);
//         bot.sendMessage(msg.chat.id, err.message);
//       });
//   }
// });

bot.onText(/\/list-issues/, async (msg) => {
  let idProject: string | undefined;
  let projects: any = [];
  await axios
    .get('https://gitlab.com/api/v4/groups/15116102/projects', {
      headers: {
        Authorization: 'Bearer glpat-EwNsMfkA5gJYNLjDxnJ6',
      },
    })
    .then((res) => {
      projects = res.data.map((p: any) => [
        {
          text: p.name,
          callback_data: p.id,
        },
      ]);
    });
  bot.sendMessage(msg.chat.id, 'Choose your project', {
    reply_markup: {
      inline_keyboard: projects,
    },
  });
  bot.on('callback_query', (data) => {
    idProject = data.data;
    axios
      .get(`${process.env.API_GITLAB_URL}/projects/${idProject}/issues`, {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
        },
      })
      .then((res) => {
        let responseTelegram = `List issue of project ${idProject}:\n`;
        for (let item of res.data) {
          responseTelegram += `Issue ${item.id}: ${item.title}\n`;
          // if (item.assignment.name) {
          //   responseTelegram += ` assign to ${item.assignee.name}\n`;
          // } else {
          //   responseTelegram += '\n';
          // }
        }

        bot.sendMessage(msg.chat.id, responseTelegram);
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(msg.chat.id, err.message);
      });
  });
});

bot.onText(/\/add-issue/, async (msg) => {
  // let idProject: string | undefined;
  // let assign = '';
  let projects: any = [];
  // let members: any = [];
  await axios
    .get('https://gitlab.com/api/v4/groups/15116102/projects', {
      headers: {
        Authorization: 'Bearer glpat-yCGSw2AkVyDtWERHy-4z',
      },
    })
    .then((res) => {
      projects = res.data.map((p: any) => [
        {
          text: p.name,
          callback_data: p.id,
        },
      ]);
    });
  await bot.sendMessage(msg.chat.id, 'Choose your project', {
    reply_markup: {
      inline_keyboard: projects,
    },
  });
  // bot.on('callback_query', async (data) => {
  //   projectId = data.data as string;
  //   idProject = data.data;
  //   try {
  //     await bot.deleteMessage(
  //       data.message!.chat!.id,
  //       data!.message!.message_id.toString()
  //     );
  //   } catch (err) {}
  //   await axios
  //     .get('https://gitlab.com/api/v4/groups/15116102/members', {
  //       headers: {
  //         Authorization: 'Bearer glpat-EwNsMfkA5gJYNLjDxnJ6',
  //       },
  //     })
  //     .then((res) => {
  //       members = res.data.map((p: any) => [
  //         {
  //           text: p.name,
  //           callback_data: p.id,
  //         },
  //       ]);
  //     });
  //   await bot.sendMessage(
  //     msg.chat.id,
  //     `Choose assignment to projectID: ${idProject}`,
  //     {
  //       reply_markup: {
  //         inline_keyboard: members,
  //       },
  //     }
  //   );
  //   bot.on('callback_query', async (data2) => {
  //     assign = data2.data as string;
  //     try {
  //       await bot.deleteMessage(
  //         data2!.message!.chat.id,
  //         data2!.message!.message_id.toString()
  //       );
  //     } catch (err) {}
  //     await bot.sendMessage(
  //       msg.chat.id,
  //       'Type /issue title of issue to end the action'
  //     );
  //     bot.onText(/\/issue/, async (message) => {
  //       if (message!.text!.split(' ').length <= 1) {
  //         bot.sendMessage(msg!.chat.id, 'Invalid issue title');
  //       } else {
  //         let title = message.text?.slice(message.text.indexOf(' '));
  //         await axios
  //           .post(
  //             `${process.env.API_GITLAB_URL}/projects/${idProject}/issues`,
  //             {
  //               title: title,
  //               assignee_id: assign,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
  //               },
  //             }
  //           )
  //           .then((res) => {
  //             let responseTelegram = `add issue ${title} to project ${idProject} successfully`;
  //             bot.sendMessage(msg!.chat.id, responseTelegram);
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             bot.sendMessage(msg!.chat.id, err.message);
  //           });
  //       }
  //     });
  //   });
  // });
});

// bot.on('callback_query', async (data2) => {
//   let members: any = [];
//   if (data2!.message!.text === 'Choose assignment') {
//     console.log('🚀 ~ file: index.ts ~ line 512 ~ bot.on ~ data2', data2);
//     memberId = data2.data as string;
//     try {
//       await bot.deleteMessage(
//         data2!.message!.chat.id,
//         data2!.message!.message_id.toString()
//       );
//     } catch (err) {}
//     await bot.sendMessage(
//       data2!.message!.chat.id,
//       'Type /issue title of issue to end the action'
//     );
//   } else if (data2!.message!.text === 'Choose your project') {
//     try {
//       await bot.deleteMessage(
//         data2!.message!.chat.id,
//         data2!.message!.message_id.toString()
//       );
//     } catch (err) {}
//     projectId = data2.data as string;
//     console.log('🚀 ~ file: index.ts ~ line 531 ~ bot.on ~ data2', data2);
//     console.log(
//       '🚀 ~ file: index.ts ~ line 531 ~ bot.on ~ projectId',
//       projectId
//     );
//     await axios
//       .get('https://gitlab.com/api/v4/groups/15116102/members', {
//         headers: {
//           Authorization: 'Bearer glpat-EwNsMfkA5gJYNLjDxnJ6',
//         },
//       })
//       .then((res) => {
//         members = res.data.map((p: any) => [
//           {
//             text: p.name,
//             callback_data: p.id,
//           },
//         ]);
//       });
//     await bot.sendMessage(
//       data2!.message!.chat.id,
//       `Choose assignment to projectID: ${projectId}`,
//       {
//         reply_markup: {
//           inline_keyboard: members,
//         },
//       }
//     );
//   }
// });

bot.on('callback_query', async (data2) => {
  let members: any = [];
  if (data2!.message!.text === 'Choose assignment') {
    memberId = data2.data as string;
    await bot.editMessageText('Type /issue title of issue to end the action', {
      chat_id: data2!.message?.chat.id,
      message_id: data2!.message?.message_id,
    });
  } else if (data2!.message!.text === 'Choose your project') {
    projectId = data2.data as string;
    await axios
      .get('https://gitlab.com/api/v4/groups/15116102/members', {
        headers: {
          Authorization: 'Bearer glpat-EwNsMfkA5gJYNLjDxnJ6',
        },
      })
      .then((res) => {
        members = res.data.map((p: any) => [
          {
            text: p.name,
            callback_data: p.id,
          },
        ]);
      });
    await bot.editMessageText('Choose assignment', {
      chat_id: data2!.message?.chat.id,
      message_id: data2!.message?.message_id,
      reply_markup: { inline_keyboard: members },
    });
  }
});

bot.onText(/\/issue/, async (message) => {
  if (message!.text!.split(' ').length <= 1) {
    bot.sendMessage(message!.chat.id, 'Invalid issue title');
  } else {
    let title = message.text?.slice(message.text.indexOf(' '));
    await axios
      .post(
        `${process.env.API_GITLAB_URL}/projects/${projectId}/issues`,
        {
          title: title,
          assignee_id: memberId,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
          },
        }
      )
      .then((res) => {
        let responseTelegram = `add issue ${title} to project ${projectId} successfully`;
        bot.sendMessage(message!.chat.id, responseTelegram);
        projectId = '';
        memberId = '';
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(message!.chat.id, err.message);
      });
  }
});

// bot.onText(/\/add-issue-project-user /, function onTextHandler(msg) {
//   let mess = '';
//   let idProject = '';
//   let issueStr = '';
//   let idUser = '';
//   let msgText = msg.text;
//   if (msgText && msgText.split(' ').length == 4) {
//     idProject = msgText.split(' ')[1];
//     issueStr = msgText.split(' ')[2];
//     idUser = msgText.split(' ')[3];
//   } else {
//     mess = 'Your input not valid';
//   }
//   if (mess) {
//     bot.sendMessage(msg.chat.id, mess);
//   } else {
//     axios
//       .post(
//         `${process.env.API_GITLAB_URL}/projects/${idProject}/issues`,
//         {
//           title: issueStr,
//           assignee_id: idUser,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.ACCESS_TOKEN_GITLAB}`,
//           },
//         }
//       )
//       .then((res) => {
//         let responseTelegram = `add issue ${issueStr} to project ${idProject} to user ${idUser} successfully`;
//         bot.sendMessage(msg.chat.id, responseTelegram);
//       })
//       .catch((err) => {
//         console.log(err);
//         bot.sendMessage(msg.chat.id, err.message);
//       });
//   }
// });

// Handle callback queries
// bot.on(
//   'callback_query',
//   function onCallbackQuery(callbackQuery: TelegramBot.CallbackQuery) {
//     const action = callbackQuery.data;
//     const msg = callbackQuery.message as TelegramBot.Message;
//     console.log(msg);
//     const opts = {
//       chat_id: msg.chat.id,
//       message_id: msg.message_id,
//     };
//     let text = '';
//     if (action === 'A1' && msg.text) {
//       text = 'Pin message successfully';
//     } else {
//       text = '';
//     }
//     // if (text === 'Add issue and pin message successfully') {
//     //   bot.pinChatMessage(msg.chat.id, msg.message_id);
//     // }
//     bot.editMessageText(text, opts);
//   }
// );
