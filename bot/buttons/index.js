const { randomButton } = require("./random.js");
const { prevButton } = require("./previous");
const { likeButton } = require("./like");
const { openiInTelegraph } = require("./open_in_telegraph.js");
const { fixInstantView } = require("./fix_instant_view.js");
const { searchtips } = require("./help_searchtips.js");
const { help_back } = require("./help_back.js");
const { saveAndGetUser } = require("../../db/saveAndGetUser");

module.exports.cb_query = async function (ctx, next) {
  // await ctx.answerCbQuery().catch((err) => {
  //   console.log(err);
  // });
  let query_data = ctx.update.callback_query.data;
  console.log(query_data);
// console.log("ctx.update.callback_query")
// console.log()
if(ctx.update.callback_query && ctx.update.callback_query.date && ctx.update.callback_query < 1612959500){
  return
}
// console.log(ctx.update.callback_query)
// console.log("ctx.update.callback_query")
if(ctx.update.callback_query.date < 1612958359)
{
  return
}

  if (query_data[0] == "r") {
    await randomButton(ctx).catch(err=>console.log(err));
  } else if (query_data.match("open")) {
    await openiInTelegraph(ctx).catch((err) => {
      console.log(err);
      return
    });;
  } else if (query_data.match("prev")) {
    await prevButton(ctx).catch((err) => {
      console.log(err);
      return
    });;
  } else if (query_data.match("like_")) {
    await likeButton(ctx);
  } else if (query_data.match("fix_") || query_data.match("fixLater_")) {
    await fixInstantView(ctx);
  } else if (query_data.match("searchtips")) {
    await searchtips(ctx);
  } else if (query_data.match("helpsearchback")) {
    await help_back(ctx);
  } else if (query_data.match("fixing")) {
    await ctx
      .answerCbQuery("Please wait.", true)
      .catch((err) => console.log(err));
  } else if (query_data == "settings" || query_data == "back_to_settings") {
    let user = await saveAndGetUser(ctx);
    await editSettings(user, ctx);
  } else if (query_data == "change_search_type") {
    let user = await saveAndGetUser(ctx);
    user.search_type = user.search_type == "article" ? "photo" : "article";
    user.save();
    await editSettings(user, ctx);
  } else if (query_data == "change_search_sorting") {
    let user = await saveAndGetUser(ctx);
    user.search_sorting = user.search_sorting == "date" ? "popular" : "date";
    user.save();
    await editSettings(user, ctx);
  } else if (query_data == "can_repeat_in_random") {
    let user = await saveAndGetUser(ctx);
    user.can_repeat_in_random = user.can_repeat_in_random ? false : true;
    user.save();
    await editSettings(user, ctx);
  } else if (query_data == "changa_rangom_localy") {
    let user = await saveAndGetUser(ctx);
    user.random_localy = user.random_localy ? false : true;
    user.save();
    await editSettings(user, ctx);
  } else if (query_data == "change_language") {
    let user = await saveAndGetUser(ctx);
    await editLangs(user, ctx);
  } else if (query_data.match("select_")) {
    let lang = query_data.split("_")[1];
    user = await saveAndGetUser(ctx);
    if (user.language_code == lang) {
      return;
    }
    user.language_code = lang;
    ctx.i18n.locale(lang);
    user.save();
    await editLangs(user, ctx);
  }
};
async function editLangs(user, ctx) {
  // supported langs:
  const langs = [
    { name: "Русский", code: "ru" },
    { name: "English", code: "en" },
    { name: "Español", code: "es" },
  ];
  let check = false,
    inline_keyboard = [];
  // add ✅ to currently selected language
  langs.forEach((x) => {
    if (x.code == user.language_code) {
      x.name += " ✅";
      check = true;
    }
    inline_keyboard.push([
      {
        text: x.name,
        callback_data: "select_" + x.code,
      },
    ]);
  });
  /* if language code was not specified in the setings,
     then it's english: */
  if (!check) {
    inline_keyboard[1].text = +" ✅";
  }
  inline_keyboard.push([
    {
      text: ctx.i18n.t("back_button"),
      callback_data: "back_to_settings",
    },
  ]);
  await ctx
    .editMessageText(ctx.i18n.t("choose_a_language"), {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: inline_keyboard,
      },
    })
    .catch((err) => {});
}
async function editSettings(user, ctx) {
  let search_type =
      user.search_type == "article"
        ? ctx.i18n.t("article")
        : ctx.i18n.t("gallery"),
    search_sorting =
      user.search_sorting == "date"
        ? ctx.i18n.t("date")
        : ctx.i18n.t("popular"),
    random_localy = user.random_localy ? ctx.i18n.t("yes") : ctx.i18n.t("no"),
    can_repeat_in_random = user.can_repeat_in_random
      ? ctx.i18n.t("yes")
      : ctx.i18n.t("no"),
    language = ctx.i18n.t("current_language");
  await ctx
    .editMessageText(ctx.i18n.t("settings"), {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.i18n.t("search_appearance") + search_type,
              callback_data: "change_search_type",
            },
          ],
          [
            {
              text: ctx.i18n.t("search_sorting") + search_sorting,
              callback_data: "change_search_sorting",
            },
          ],
          [
            {
              text: ctx.i18n.t("random_localy") + random_localy,
              callback_data: "changa_rangom_localy",
            },
          ],
          [
            {
              text: ctx.i18n.t("allow_repeat_in_random") + can_repeat_in_random,
              callback_data: "can_repeat_in_random",
            },
          ],

          [
            {
              text: language,
              callback_data: "change_language",
            },
          ],
        ],
      },
    })
    .catch((err) => {
      console.log(err);
    });
}
