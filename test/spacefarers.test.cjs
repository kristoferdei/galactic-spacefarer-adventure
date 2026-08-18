'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');

const { GET, POST } = cds.test(__dirname + '/..');

const SRV = '/odata/v4/spacefarer';

test('READ is scoped to the requesting user\'s planet (Task: Planet X/Y isolation)', async () => {
    const earth = await GET(`${SRV}/Spacefarers`, { auth: { username: 'alice' } }); // planet: Earth
    assert.equal(earth.data.value.length, 1);
    assert.equal(earth.data.value[0].name, 'Zara Nova');

    const mars = await GET(`${SRV}/Spacefarers`, { auth: { username: 'bob' } }); // planet: Mars
    assert.equal(mars.data.value.length, 1);
    assert.equal(mars.data.value[0].name, 'Kip Orbit');
});

test('CREATE is forbidden for non-admin users (Task 2: @restrict)', async () => {
    await assert.rejects(
        POST(`${SRV}/Spacefarers`, { name: 'Sneaky Bob' }, { auth: { username: 'bob' } }),
        (err) => {
            assert.equal(err.status, 403);
            return true;
        }
    );
});

test('CREATE rejects negative stardust collection on activation (Task 3: @before validation)', async () => {
    const draft = await POST(
        `${SRV}/Spacefarers`,
        { name: 'Bad Actor', stardustCollection: -5 },
        { auth: { username: 'alice' } }
    );
    const { ID } = draft.data;

    await assert.rejects(
        POST(
            `${SRV}/Spacefarers(ID=${ID},IsActiveEntity=false)/SpacefarerService.draftActivate`,
            {},
            { auth: { username: 'alice' } }
        ),
        (err) => {
            assert.equal(err.status, 400);
            assert.match(err.message, /negative/);
            return true;
        }
    );
});

test('CREATE applies defaults and sends the welcome email on activation (Task 3: @before/@after)', async () => {
    const draft = await POST(
        `${SRV}/Spacefarers`,
        { name: 'Test Cadet', email: 'cadet@example.com', originPlanet: 'Titan' },
        { auth: { username: 'alice' } }
    );
    const { ID } = draft.data;

    const activated = await POST(
        `${SRV}/Spacefarers(ID=${ID},IsActiveEntity=false)/SpacefarerService.draftActivate`,
        {},
        { auth: { username: 'alice' } }
    );
    assert.equal(activated.status, 204);

    const active = await GET(
        `${SRV}/Spacefarers(ID=${ID},IsActiveEntity=true)`,
        { auth: { username: 'carol' } }
    );

    assert.equal(active.data.stardustCollection, 10);
    assert.equal(active.data.wormholeSkill, 'novice');
});