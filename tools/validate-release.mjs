import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function option(name) {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
}

function readJson(relativePath) {
    const path = join(rootDir, relativePath);
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        throw new Error(`Cannot read ${relativePath}: ${error.message}`);
    }
}

function requireNonEmptyFile(directory, file) {
    const path = join(directory, file);
    if (!existsSync(path)) {
        throw new Error(`Missing release asset: ${file}`);
    }
    if (!statSync(path).isFile() || statSync(path).size === 0) {
        throw new Error(`Release asset is empty or not a file: ${file}`);
    }
}

function readAssetManifest(directory) {
    const path = join(directory, 'manifest.json');
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        throw new Error(`Cannot read release asset manifest.json: ${error.message}`);
    }
}

try {
    const manifest = readJson('manifest.json');
    const packageJson = readJson('package.json');
    const versions = readJson('versions.json');
    const assetDir = resolve(rootDir, option('--assets-dir') ?? '.');
    const requestedTag = option('--tag') ?? process.env.GITHUB_REF_NAME;
    const normalizedTag = requestedTag?.replace(/^refs\/tags\//, '').replace(/^v/, '');

    if (typeof manifest.version !== 'string' || !manifest.version) {
        throw new Error('manifest.json must contain a non-empty string version');
    }
    if (packageJson.version !== manifest.version) {
        throw new Error(
            `Version mismatch: package.json=${packageJson.version}, manifest.json=${manifest.version}`,
        );
    }
    if (!Object.prototype.hasOwnProperty.call(versions, manifest.version)) {
        throw new Error(`versions.json has no entry for ${manifest.version}`);
    }
    if (normalizedTag && normalizedTag !== manifest.version) {
        throw new Error(
            `Release tag ${requestedTag} does not match manifest version ${manifest.version}`,
        );
    }

    const assets = ['main.js', 'manifest.json'];
    if (existsSync(join(rootDir, 'styles.css'))) {
        assets.push('styles.css');
    }
    for (const asset of assets) {
        requireNonEmptyFile(assetDir, asset);
    }
    const assetManifest = readAssetManifest(assetDir);
    if (assetManifest.id !== manifest.id || assetManifest.version !== manifest.version) {
        throw new Error(
            `Release manifest mismatch: expected ${manifest.id}@${manifest.version}, ` +
            `got ${assetManifest.id}@${assetManifest.version}`,
        );
    }

    console.log(`Release validation passed for ${manifest.version}: ${assets.join(', ')}`);
} catch (error) {
    console.error(`Release validation failed: ${error.message}`);
    process.exitCode = 1;
}
