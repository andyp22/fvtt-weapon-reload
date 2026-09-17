const { execSync } = require('child_process');

function getFullCommit(abbreviatedHash) {
    try {
        return execSync(`git rev-parse ${abbreviatedHash}`).toString().trim();
    } catch (error) {
        console.error(
            `Unable to retrieve full commit hash fo ${abbreviatedHash}, using abbreviated hash instead:`,
            error
        );
    }
    return abbreviatedHash;
}

function getCommitUrl(commitHash) {
    return `https://github.com/andyp22/fvtt-weapon-reload/commit/${commitHash}`;
}

async function getReleaseLine(changeset, _type) {
    const fullCommit = changeset.commit ? getFullCommit(changeset.commit) : '';
    const commitUrl = fullCommit ? getCommitUrl(fullCommit) : '';

    const [firstLine, ...futureLines] = changeset.summary
        .split('\n')
        .map((l) => l.trimEnd());

    let returnVal = `- ${fullCommit ? `[${fullCommit.slice(0, 7)}](${commitUrl}): ` : ''}${firstLine}`;

    if (futureLines.length > 0) {
        returnVal += `\n${futureLines.map((l) => `  ${l}`).join('\n')}`;
    }

    return returnVal;
}

async function getDependencyReleaseLine(changesets, dependenciesUpdated) {
    if (dependenciesUpdated.length === 0) return '';

    const changesetLinks = changesets.map((changeset) => {
        const fullCommit = changeset.commit
            ? getFullCommit(changeset.commit)
            : '';
        const commitUrl = fullCommit ? getCommitUrl(fullCommit) : '';

        return `- Updated dependencies${fullCommit ? `[${fullCommit.slice(0, 7)}](${commitUrl}): ` : ''}`;
    });

    const updateDependenciesList = dependenciesUpdated.map(
        (dep) => `  - ${dep.name}@${dep.newVersion}`
    );

    return [...changesetLinks, ...updateDependenciesList].join('\n');
}

module.exports = {
    getReleaseLine,
    getDependencyReleaseLine,
};
