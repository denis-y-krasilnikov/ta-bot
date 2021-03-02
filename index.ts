import "./utils/dotenv";
import { DiscordClient } from "./core/discord/discordClient";
import { messageHandler } from "./core/messenger/messageHandlers/messageHandler";
import { debugHandler } from "./core/messenger/messageHandlers/debugHandler";
import { errorHandler } from "./core/messenger/messageHandlers/errorHandler";
import { UpdatesHandler } from "./core/github/updatesHandler";
import { Messenger } from "./core/messenger/messenger";

(async () => {
    const discordClient = new DiscordClient(process.env.DISCORD_TOKEN);
    await discordClient.login();

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
    const uvpDesktopHandler = new UpdatesHandler({
        owner: "optimaxdev",
        repository: "UVP-Desktop",
        messenger
    });
    const uvpMobileHandler = new UpdatesHandler({
        owner: "optimaxdev",
        repository: "UVP-Mobile",
        messenger
    });
    const uhcDesktopHandler = new UpdatesHandler({
        owner: "optimaxdev",
        repository: "UHC-Glasses-Desktop",
        messenger,
    });
    const uhcMobileHandler = new UpdatesHandler({
        owner: "optimaxdev",
        repository: "UHC-Glasses-Mobile",
        messenger,
    });

    await gusaDesktopHandler.init();
    await gusaDesktopHandler.run();
    await gusaMobileHandler.init();
    await gusaMobileHandler.run();
    await uvpDesktopHandler.init();
    await uvpDesktopHandler.run();
    await uvpMobileHandler.init();
    await uvpMobileHandler.run();
    await uhcDesktopHandler.init();
    await uhcDesktopHandler.run();
    await uhcMobileHandler.init();
    await uhcMobileHandler.run();
})();
