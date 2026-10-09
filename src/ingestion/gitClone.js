const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Parses owner and repo name from various GitHub URL formats:
 * - https://github.com/facebook/react
 * - https://github.com/facebook/react.git
 * - git@github.com:facebook/react.git
 * - facebook/react
 */
function parseGitHubUrl(urlOrSlug) {
    if (!urlOrSlug || typeof urlOrSlug !== "string") {
        throw new Error("Invalid GitHub URL or slug provided.");
    }

    let cleaned = urlOrSlug.trim();

    // Handle SSH format git@github.com:owner/repo.git
    if (cleaned.startsWith("git@github.com:")) {
        cleaned = cleaned.replace("git@github.com:", "");
    } else {
        // Strip protocol and domain
        cleaned = cleaned
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/^github\.com\//, "");
    }

    cleaned = cleaned.replace(/\.git$/, "").replace(/\/+$/, "");

    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length < 2) {
        throw new Error(`Could not parse owner and repo from "${urlOrSlug}". Expected format: owner/repo or https://github.com/owner/repo`);
    }

    const owner = parts[0];
    const repo = parts[1];

    return {
        owner,
        repo,
        cloneUrl: `https://github.com/${owner}/${repo}.git`
    };
}

/**
 * Clones or updates a GitHub repository locally under ./repos/<owner>/<repo>
 */
async function cloneGitHubRepository(urlOrSlug, baseDir = path.join(process.cwd(), "repos")) {
    const { owner, repo, cloneUrl } = parseGitHubUrl(urlOrSlug);
    const targetDir = path.join(baseDir, owner, repo);

    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    if (fs.existsSync(path.join(targetDir, ".git"))) {
        console.log(`Repository already exists at ${targetDir}. Pulling latest changes...`);
        try {
            execFileSync("git", ["pull"], {
                cwd: targetDir,
                encoding: "utf8"
            });
        } catch (error) {
            console.warn(`git pull failed (${error.message}). Re-cloning fresh copy...`);
            fs.rmSync(targetDir, { recursive: true, force: true });
            execFileSync("git", ["clone", "--depth", "50", cloneUrl, targetDir], {
                encoding: "utf8"
            });
        }
    } else {
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }
        console.log(`Cloning ${cloneUrl} into ${targetDir}...`);
        execFileSync("git", ["clone", "--depth", "50", cloneUrl, targetDir], {
            encoding: "utf8"
        });
    }

    return {
        owner,
        repo,
        localPath: targetDir,
        cloneUrl
    };
}

module.exports = {
    parseGitHubUrl,
    cloneGitHubRepository
};

