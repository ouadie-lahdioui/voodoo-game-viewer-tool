
const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return await response.json();
};

const formatGame = game => ({
    publisherId: game.publisher_id,
    name: game.name,
    platform: game.os,
    bundleId: game.bundle_id,
    appVersion: game.version,
    isPublished: game.publisher_id ? true : false, // Rule to be confirmed with the product owner
    createdAt: new Date(game.release_date), // To be confirmed with the product owner, release_date is the same as createdAt ?
    updatedAt: new Date(game.updated_date)
});

module.exports = { 
    fetchJson,
    formatGame 
};