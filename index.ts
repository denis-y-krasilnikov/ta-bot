import "./utils/dotenv";
import { DiscordClient } from "./core/discord/discordClient";
import { messageHandler } from "./core/messenger/messageHandlers/messageHandler";
import { debugHandler } from "./core/messenger/messageHandlers/debugHandler";
import { errorHandler } from "./core/messenger/messageHandlers/errorHandler";
import { UpdatesHandler } from "./core/github/updatesHandler";
import { Events, Messenger } from "./core/messenger/messenger";

(async () => {
    const discordClient = new DiscordClient(process.env.DISCORD_TOKEN);
    await discordClient.login();
    // await discordClient.logout();

    const messenger = new Messenger();
    messenger.addHandler(messageHandler(discordClient));
    messenger.addHandler(debugHandler);
    messenger.addHandler(errorHandler);

    const gusaDesktopHandler = new UpdatesHandler({
        owner: "optimaxdev",
        repository: "GlassesUSA-Desktop",
        messenger
    });

    const gusaMobileHandler = new UpdatesHandler({
        owner: "optimaxdev",
        repository: "GlassesUSA-Mobile",
        messenger
    });
    try {
        await gusaDesktopHandler.init();
        await gusaDesktopHandler.run();
        await gusaMobileHandler.init();
        await gusaMobileHandler.run();
    } catch (e) {
        await messenger.message(Events.ERROR, null, e.message);
    }
})();
