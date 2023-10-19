import AWS from "aws-sdk";

import express from "express";

import serverless from "serverless-http";

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get("/users/:userId", async (req, res) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId,
        },
    };

    try {
        const result = await dynamoDbClient.get(params).promise();

        if (result.Item) {
            const { userId, name, email} = result.Item;

            res.json({ userId, name, email });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: "Could not retrieve user" });
    }
});

app.post("/users", async (req, res) => {
    const { userId, name, email } = req.body;

    if (typeof userId !== "string") {
        res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== "string") {
        res.status(400).json({ error: '"name" must be a string' });
    } else if (typeof email !== "string") {
        res.status(400).json({ error: '"email" must be a string' });
    }

    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId,
            name,
            email,
        },
    };

    try {
        await dynamoDbClient.put(params).promise();

        res.json({ userId, name, email });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: "Could not create user" });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

export const handler = serverless(app);

