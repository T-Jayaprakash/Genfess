// Example: How to add version checking endpoint to your Express.js server
// Add this to your existing server code

import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for your app domain
app.use(cors({
    origin: '*', // In production, replace with your domain
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
}));

// Version checking endpoint
app.get('/api/version.json', (req, res) => {
    // You can store this in a database, file, or hardcode it
    const versionInfo = {
        latestVersion: '2.8.0',
        minSupportedVersion: '2.8.0',
        updateUrl: 'https://lastbench.in/download',
        forceUpdate: true,
        message: 'Critical bug fixes. Please update to continue using Lastbench.'
    };

    // Set cache headers to ensure clients always get latest version info
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json(versionInfo);
});

// Example: Dynamic version management (load from file)
import fs from 'fs';
import path from 'path';

app.get('/api/version-dynamic.json', (req, res) => {
    try {
        const versionPath = path.join(__dirname, 'version.json');
        const versionData = fs.readFileSync(versionPath, 'utf8');
        const versionInfo = JSON.parse(versionData);

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(versionInfo);
    } catch (error) {
        console.error('Error reading version.json:', error);
        // Fallback version info
        res.json({
            latestVersion: '2.8.0',
            minSupportedVersion: '2.8.0',
            updateUrl: 'https://lastbench.in/download',
            forceUpdate: false,
            message: 'Unable to check for latest version'
        });
    }
});

// Example: Version management with database
// (Requires a database setup)
app.get('/api/version-db.json', async (req, res) => {
    try {
        // Replace with your actual database query
        // const versionInfo = await db.query('SELECT * FROM app_version LIMIT 1');

        const versionInfo = {
            latestVersion: '2.8.0',
            minSupportedVersion: '2.8.0',
            updateUrl: 'https://lastbench.in/download',
            forceUpdate: true,
            message: 'Please update to the latest version'
        };

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json(versionInfo);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to fetch version information'
        });
    }
});

// Admin endpoint to update version info (requires authentication!)
app.post('/api/admin/update-version', (req, res) => {
    // TODO: Add authentication middleware here!
    // if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { latestVersion, minSupportedVersion, updateUrl, forceUpdate, message } = req.body;

    // Validate input
    if (!latestVersion || !minSupportedVersion || !updateUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const versionInfo = {
            latestVersion,
            minSupportedVersion,
            updateUrl,
            forceUpdate: forceUpdate || false,
            message: message || 'Please update to the latest version'
        };

        // Save to file or database
        fs.writeFileSync(
            path.join(__dirname, 'version.json'),
            JSON.stringify(versionInfo, null, 2)
        );

        res.json({ success: true, versionInfo });
    } catch (error) {
        console.error('Error updating version:', error);
        res.status(500).json({ error: 'Failed to update version' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Version endpoint: http://localhost:${PORT}/api/version.json`);
});

export default app;
