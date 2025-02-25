const assert = require('assert');
const { fetchJson, formatGame } = require('../utils');

describe('fetchJson', () => {
    const FAKE_API_URL = 'https://vodoo.awesome.api.com/games.json';

    let fetchStub;

    beforeEach(() => {
        fetchStub = global.fetch = (...args) => {
            return {
                ok: false, // To simulate failure
                json: async () => ({}),
                status: 500,
                statusText: 'Internal server error',
            };
        };
    });

    it('Should returns JSON when fetch is successful', async () => {
        const mockData = { message: "Success" };

        fetchStub = global.fetch = async (url) => ({
            ok: true,
            json: async () => mockData
        });

        const result = await fetchJson(FAKE_API_URL);

        assert.deepStrictEqual(result, mockData);
    });

    it('should throw an error when fetch fails with a non 200 status', async () => {
        fetchStub = global.fetch = async (url) => ({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            json: async () => ({})
        });

        try {
            await fetchJson(FAKE_API_URL);
            assert.fail('Expected error to be thrown');
        } catch (error) {
            assert.strictEqual(error.message, 'Failed to fetch: 404 Not Found');
        }
    });

    it('should throw an error when fetch encounters a network failure', async () => {
        fetchStub = global.fetch = async (url) => {
            throw new Error('Network error');
        };

        try {
            await fetchJson(FAKE_API_URL);
            assert.fail('Expected error to be thrown');
        } catch (error) {
            assert.strictEqual(error.message, 'Network error');
        }
    });
});


describe('formatGame', () => {

    it('Should format game', async () => {
        const rawGame = {
            publisher_id: 1,
            name: 'Awesome Game',
            os: 'Android',
            bundle_id: 'com.awesome.game',
            version: '1.0.0',
            release_date: '2020-01-01',
            updated_date: '2020-01-01'
        };

        const expected = {
            publisherId: 1,
            name: 'Awesome Game',
            platform: 'Android',
            bundleId: 'com.awesome.game',
            appVersion: '1.0.0',
            isPublished: true,
            createdAt: new Date('2020-01-01'),
            updatedAt: new Date('2020-01-01')
        };  

        assert.deepStrictEqual(formatGame(rawGame), expected); 
    }); 
});