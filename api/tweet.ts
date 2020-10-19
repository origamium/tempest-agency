import { NowRequest, NowResponse } from "@now/node";
import fastify, { FastifyInstance } from "fastify";
import fetch, { Headers } from "node-fetch";
import oauth1a from "oauth-1.0a";
import crypto from "crypto-js";

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TEST_KEY = process.env.TEST_KEY;

const oauth_callback = "https://tempest-client.now.sh/";

const tweet = (): FastifyInstance => {
    const app = fastify({ logger: true });
    app.get("/api/tweet", async (req, res) => {
        const { code } = req.query as { code: string };
        if (code === TEST_KEY) {
            const oauth = new oauth1a({
                consumer: {
                    key: TWITTER_CLIENT_ID ?? "",
                    secret: TWITTER_CLIENT_SECRET ?? "",
                },
                signature_method: "HMAC-SHA1",
                hash_function(base_string, key) {
                    return crypto
                        .HmacSHA1(base_string, `${encodeURIComponent(TWITTER_CLIENT_SECRET)}&`)
                        .toString(crypto.enc.Base64);
                },
            });

            const oauth_data = oauth.toHeader(
                oauth.authorize({
                    url: "https://api.twitter.com/oauth/request_token",
                    method: "POST",
                    data: { oauth_callback },
                })
            );

            const headers = new Headers();
            headers.append("Authorization", oauth_data.Authorization);

            const result = await fetch("https://api.twitter.com/oauth/request_token", {
                method: "POST",
                body: JSON.stringify({ oauth_callback }),
                headers,
            });

            res.status(200);
            res.send(await result.text());
        } else {
            res.status(400);
            res.send("bad request");
        }
    });

    return app;
};

const tweetService = tweet();

module.exports = async (req: NowRequest, res: NowResponse): Promise<void> => {
    await tweetService.ready();
    tweetService.server.emit("request", req, res);
};
