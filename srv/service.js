import cds from '@sap/cds';
import { sendWelcomeEmail } from './lib/mailer.js';

export default cds.service.impl(async function () {
  const { Spacefarers } = this.entities;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  this.before('CREATE', Spacefarers, async (req) => {
    const { stardustCollection, wormholeSkill, email } = req.data;

    if (stardustCollection != null && stardustCollection < 0) {
      req.error(400, 'Stardust collection cannot be negative, cadet.');
      return;
    }

    if (email && !EMAIL_RE.test(email)) {
      req.error(400, `'${email}' doesn't look like a valid email address, cadet.`);
      return;
    }

    if (!stardustCollection) {
      req.data.stardustCollection = 10;
    }

    if (!wormholeSkill) {
      req.data.wormholeSkill = 'novice';
    }
  });

  this.after('CREATE', Spacefarers, async (data, req) => {
    const spacefarer = {
      name: req.data?.name ?? data?.name ?? 'new spacefarer',
      email: req.data?.email ?? data?.email,
      originPlanet: req.data?.originPlanet ?? data?.originPlanet
    };

    try {
      await sendWelcomeEmail(spacefarer);
    } catch (err) {
      console.error(`Failed to send welcome email to ${spacefarer.name}:`, err.message);
    }
  });

  this.before('READ', Spacefarers, (req) => {
    const userPlanet = req.user?.attr?.planet;
    if (userPlanet) {
      req.query.where('department.planet =', userPlanet);
    }
  });
});
