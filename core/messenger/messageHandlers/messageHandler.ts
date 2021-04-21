import { DiscordClient } from '../../discord/discordClient';
import { Events } from '../messenger';
import { PullRequest } from '../../github/pullRequest';
import { logInFile } from '../../../utils/logInFile';
import { format } from 'util';

const usersMapping = {
    'nikita-perep': '<@691221955579478016>',
    RomanLi182: '<@656471318274899987>',
    RomanMishushin: '<@691712005601755147>',
    'ilya-mishushin': '<@557235247369158682>',
    dmitrychelyaev: '<@691221927859191809>',
    kondratievm: '<@590586790725943328>',
    ArtemiyIvlev: '<@248915828488142848>',
    'stan-san': '<@691770911057117204>',
    'stercoris': '<@445194258270519297>',
};

export const messageHandler = (discordClient: DiscordClient) => async (
    event: Events,
    pr: PullRequest,
    ...args: unknown[]
): Promise<void> => {
    const log = async (message) => {
        if ([Events.CLEAR].includes(event)) {
            const channel = await discordClient.findChannel('merge-pls');
            await channel.send({
                content: `<@691712005601755147>, pull request ${pr.getHref()} ${message}`,
            });
        } else if (
            [Events.BEHIND, Events.CHANGE_REQUEST, Events.CONFLICTING, Events.FAILING].includes(
                event,
            )
        ) {
            const channel = await discordClient.findChannel('approve-pls');
            await channel.send({
                content: `${usersMapping[pr.getAuthor()]}, pull request ${pr.getHref()} ${message}`,
            });
        } else if ([Events.CREATED, Events.PASSING].includes(event)) {
            const channel = await discordClient.findChannel('approve-pls');
            await channel.send({
                content: `@here, pull request ${pr.getHref()} ${message}`,
            });
        } else if ([Events.CLOSED, Events.UNSTABLE].includes(event)) {
            const channel = await discordClient.findChannel('approve-pls');
            await channel.send({
                content: `Pull request ${pr.getHref()} ${message}`,
            });
        }
        console.log(`[${pr.getNumber()}] Pull request ${format(message)}`);
        logInFile(`[${pr.getNumber()}] Pull request ${message}`);
    };
    switch (event) {
        case Events.BEHIND:
            await log('out-of-date');
            break;
        case Events.CHANGE_REQUEST:
            await log('has change request');
            break;
        case Events.CLEAR:
            await log('ready to merge');
            break;
        case Events.CLOSED:
            await log('closed');
            break;
        case Events.CONFLICTING:
            await log('has conflicts');
            break;
        case Events.CREATED:
            await log('opened');
            break;
        case Events.FAILING:
            await log('failing');
            break;
        case Events.PASSING:
            await log(`needs ${args[0]} more approves`);
            break;
        case Events.UNSTABLE:
            await log('ready to merge with non-passing status');
            break;
        default:
            break;
    }
};
