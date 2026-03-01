import fs from 'fs';
import http from 'http';
import path from 'path';

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`
        <html>
        <head>
            <style>
                body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #eee; }
                h1 { color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
                .log-section { margin-bottom: 40px; background: #2a2a2a; border-radius: 8px; padding: 15px; border-left: 5px solid #2196F3; }
                .filename { font-weight: bold; color: #ff9800; margin-bottom: 5px; display: block; }
                pre { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; background: #000; padding: 15px; border-radius: 4px; border: 1px solid #444; }
                .not-found { color: #f44336; font-style: italic; }
            </style>
        </head>
        <body>
            <h1>=== HOSTINGER LIVE DEBUGGER ===</h1>
            <p><strong>Current Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Node.js Version:</strong> ${process.version}</p>
            <p><strong>Running in directory:</strong> ${process.cwd()}</p>
    `);

    const logFiles = ['hostinger-debug.txt', 'error.log', 'startup.log'];

    for (const fileName of logFiles) {
        const filePath = path.join(process.cwd(), fileName);
        res.write(`<div class="log-section">`);
        res.write(`<span class="filename">${fileName}</span>`);
        try {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.size > 0) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    res.write(`<pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
                } else {
                    res.write(`<p class="not-found">File is empty.</p>`);
                }
            } else {
                res.write(`<p class="not-found">File not found.</p>`);
            }
        } catch (e) {
            res.write(`<p class="not-found">Error reading file: ${e.message}</p>`);
        }
        res.write(`</div>`);
    }

    res.write(`</body></html>`);
    res.end();
});

server.listen(port, () => {
    console.log(`Debug server running on ${port}`);
});
