import fs from 'fs';
import http from 'http';
import path from 'path';

const port = process.env.PORT || 3000;
const logPath = path.join(process.cwd(), 'hostinger-debug.txt');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("=== HOSTINGER DEBUG LOGS ===\n\n");
    res.write(`Current Time: ${new Date().toISOString()}\n`);
    res.write(`Node.js Version: ${process.version}\n`);
    res.write(`Running in directory: ${process.cwd()}\n\n`);

    try {
        if (fs.existsSync(logPath)) {
            res.write(fs.readFileSync(logPath, 'utf8'));
        } else {
            res.write("Log file not found. The server hasn't crashed or written any logs yet.\n");
            res.write(`Looking for file at: ${logPath}`);
        }
    } catch (e) {
        res.write(`Error reading logs: ${e.message}`);
    }
    res.end();
});

server.listen(port, () => {
    console.log(`Debug server running on ${port}`);
});
