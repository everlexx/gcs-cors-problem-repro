import fs from 'node:fs/promises';
import express from 'express';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const server = express();

server.use(express.json());
server.use(
	cors({
		origin: '*',
		methods: '*',
		allowedHeaders: '*',
	}),
);

server.post('/generate-signed-url', async (req, res) => {
	const storage = new Storage({
		credentials: req.body.serviceAccount,
	});

	// The bucket is private and so the file is automatically private
	const [url] = await storage
		.bucket(req.body.bucket)
		.file(uuidv4())
		.getSignedUrl({
			action: 'write',
			version: 'v4',
			virtualHostedStyle: true,
			expires: Date.now() + 3600 * 1000, // 1 hour
			contentType: 'application/octet-stream',
			extensionHeaders: {
				'x-goog-content-length-range': `${req.body.size},${req.body.size}`,
			},
		});

	res.json({ url });
});

server.listen(34567);

console.log('Starting HTTP server at port 34567 ✅');
