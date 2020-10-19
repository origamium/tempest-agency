import { NowRequest, NowResponse } from "@now/node";
import fastify, { FastifyInstance } from "fastify";
import fetch from "node-fetch";
import oauth1a from "oauth-1.0a";
import crypto from "crypto-js";

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TEST_KEY = process.env.TEST_KEY;

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
                    return crypto.HmacSHA1(base_string, key).toString(crypto.enc.Base64);
                },
            });

            // WARN: やばいかも
            const oauth_data = oauth.authorize({
                url: "https://api.twitter.com/request_token",
                method: "POST",
                data: { oauth_callback: "https://tempest-client.now.sh/" },
            });

            const result = await fetch("https://api.twitter.com/request_token", {
                method: "POST",
                headers: {
                    Authorization:
                        `OAuth oauth_consumer_key="${oauth_data.oauth_consumer_key}",` +
                        `oauth_signature_method="${oauth_data.oauth_signature_method}",` +
                        `oauth_timestamp="${oauth_data.oauth_timestamp}",` +
                        `oauth_nonce="${oauth_data.oauth_nonce}",` +
                        `oauth_version="${oauth_data.oauth_version}",` +
                        `oauth_signature="${oauth_data.oauth_signature}"`,
                },
                body: JSON.stringify({ oauth_callback: "https://tempest-client.now.sh/" }),
            });

            res.status(200);
            res.send(await result.json());
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
