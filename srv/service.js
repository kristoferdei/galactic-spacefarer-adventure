import cds from '@sap/cds';

export default cds.service.impl(async function () {
  const { Spacefarers } = this.entities;

  // --- Task 3: @Before event ------------------------------------------
  // Validate & enhance the spacefaring candidate before launch.
  this.before('CREATE', Spacefarers, async (req) => {
    const { stardustCollection, wormholeSkill } = req.data;

    if (stardustCollection != null && stardustCollection < 0) {
      req.error(400, 'Stardust collection cannot be negative, cadet.');
      return;
    }

    // Enhance: give every new spacefarer a stardust starter pack
    if (!stardustCollection) {
      req.data.stardustCollection = 10;
    }

    // Enhance: default wormhole navigation skill for rookies
    if (!wormholeSkill) {
      req.data.wormholeSkill = 'novice';
    }
  });

  // --- Task 3: @After event -------------------------------------------
  // Send a welcome notification once the spacefarer is created.
  this.after('CREATE', Spacefarers, async (data, req) => {
    // The `after` payload for CREATE only carries generated keys, so read
    // the submitted fields back from req.data (shared with the before-handler).
    const name = req.data?.name ?? data?.name ?? 'new spacefarer';

    // Swap this out for a real mailer (e.g. nodemailer) in production.
    // Kept as a log line here so the take-home runs without SMTP config.
    console.log(
      `\u2709\ufe0f  Welcome aboard, ${name}! Your journey among the stars begins now.`
    );
  });

  // --- Additional info: Planet X must not see Planet Y's data ---------
  // Instance-based restriction on top of the role-based @restrict in service.cds.
  // In a real deployment `req.user.attr.planet` would come from the XSUAA/IAS
  // token attributes; for local/mock auth it falls back to a query param
  // so the rule is demonstrable without a full identity provider setup.
  this.before('READ', Spacefarers, (req) => {
    const userPlanet = req.user?.attr?.planet;
    if (userPlanet) {
      req.query.where('department.planet =', userPlanet);
    }
  });
});
