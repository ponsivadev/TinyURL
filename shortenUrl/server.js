const express = require('express');
const bodyParser = require('body-parser');
const sdk = require("node-appwrite");

const app = express();
app.use(bodyParser.json());

const client = new sdk.Client();
client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject('66668a69001e7a818205')
    .setKey('3f9b8e13086a41a37b83a591d7ed5d5b551c2d2f50847d28b0e5ff5c346fc9a41f607ca42b1fbdf0357b7b2889a78cf20dd55ed206f4e3c0cfa5e187177cad12045e93d04b177fcc570e80f59bf76e75c885595f539a5124f4e51f39ede4f16493418fd68cec65eded1b4a3e6d8c1ae214c14a1d862704add52e2b10c0b0b699');

const databases = new sdk.Databases(client);

function generateShortCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

app.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortCode = generateShortCode();

    try {
        const response = await databases.createDocument(
            'TINYURL',
            'urlid',
            sdk.ID.unique(),
            {
                original_url: originalUrl,
                short_code: shortCode
            }
        );

        res.json({ shortUrl: `http://localhost:3000/${shortCode}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    const databaseId = 'TINYURL';
    const collectionId = 'urlid';

    try {
        const client = new sdk.Client();
        client
            .setEndpoint("https://cloud.appwrite.io/v1")
            .setProject('66668a69001e7a818205')
            .setKey('3f9b8e13086a41a37b83a591d7ed5d5b551c2d2f50847d28b0e5ff5c346fc9a41f607ca42b1fbdf0357b7b2889a78cf20dd55ed206f4e3c0cfa5e187177cad12045e93d04b177fcc570e80f59bf76e75c885595f539a5124f4e51f39ede4f16493418fd68cec65eded1b4a3e6d8c1ae214c14a1d862704add52e2b10c0b0b699')
            .setSelfSigned();

        const databases = new sdk.Databases(client);

        const response = await databases.listDocuments(databaseId, collectionId, [
            sdk.Query.equal('short_code', shortCode)
        ]);

        if (response.documents.length > 0) {
            const originalUrl = response.documents[0].original_url;
            res.redirect(originalUrl);
        } else {
            res.status(404).send('URL not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
