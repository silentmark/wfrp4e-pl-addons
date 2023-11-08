
Hooks.on("renderChatMessage", async (app, html, messageData) => {
  if (!game.user.isGM) {
    return;
  }

  let test = app.getTest();
  if (processedMessages.indexOf(app.id) == -1 && test?.weapon?.attackType == "ranged" && test?.result?.outcome == "failure" && test?.context?.targets?.length > 0 && !test?.context?.edited) {
    processedMessages.push(app.id);
    const shooter = test.actor.getActiveTokens()[0];
    const target = game.canvas.tokens.get(test.context.targets[0].token);
    const tokens =  shootDifferentTarget(shooter, target);
    if (tokens.length > 0 && (test.result.roll - test.result.target) <= 10) {
      const newTarget = tokens[Math.floor(Math.random() * tokens.length)];
      let testData = app.flags.testData;
      testData.context.edited = true;
      testData.context.previousResult = duplicate(test.result);
      testData.preData.slBonus = 0;
      testData.preData.successBonus = 0;
      testData.preData.roll = test.result.roll;
      testData.preData.target = test.target + 10;
      testData.context.targets[0].token = newTarget.id;
      testData.preData.other.push(`Ups, trafiono cel na linii ognia! <b>(${newTarget.name})</b>`);
      delete testData.context.messageId;
      let newTest = TestWFRP.recreate(testData);
      await newTest.roll();
    }
  }
});

let processedMessages = [];
function shootDifferentTarget(shooterToken, targetToken) {
  const api = game.modules.get("tokenvisibility").api;
  
  const ps = new CONFIG.GeometryLib.threeD.Point3d(shooterToken.x, shooterToken.y, shooterToken.elevationZ);
  const pt = new CONFIG.GeometryLib.threeD.Point3d(targetToken.x, targetToken.y, targetToken.elevationZ);
  const cover = new api.CoverCalculator(ps, pt);

  if (cover._hasTokenCollision(ps, pt)) {
    const ray = new Ray(ps, pt);
    let tokens = canvas.tokens.quadtree.getObjects(ray.bounds);
    tokens.delete(shooterToken);
    tokens.delete(targetToken);
    tokens = tokens.filter(t => !t.actor.effects.find(s => s.statuses.has('dead')));

    const tokensIterate = tokens.map(x=>x);
    // Set viewing position and test token sides for collisions
    for ( const t of tokensIterate ) {
      const pts = new api.TokenPoints3d(t, { pad: -1 });
      const sides = pts._viewableFaces(ps);
      let remove = true;
      for ( const side of sides ) {
        if (api.util.lineSegmentIntersectsQuadrilateral3d(
          ps, 
          pt,
          side.points[0],
          side.points[1],
          side.points[2],
          side.points[3]) ) {
            remove = false;
        }
      }
      if (remove) {
        tokens.delete(t);
      }
    }
    return Array.from(tokens);
  }
  return [];
}