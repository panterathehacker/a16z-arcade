#!/usr/bin/env node
// Fix Bug 2: Move NPC positions to y=700+ safe zone (below buildings)
const fs = require('fs');
const path = require('path');

const guestsFile = path.join(__dirname, '../game/data/guests.ts');
let content = fs.readFileSync(guestsFile, 'utf8');

const positions = {
  'marc':              [200,  750],
  'ben':               [1050, 750],
  'jensen':            [350,  800],
  'lisa':              [700,  750],
  'alexandr':          [950,  800],
  'sam-altman':        [200,  900],
  'satya':             [500,  850],
  'brian-chesky':      [800,  900],
  'patrick-collison':  [1050, 850],
  'dario-amodei':      [300,  1000],
  'chris-dixon':       [600,  950],
  'sarah':             [900,  1000],
  'elad':              [200,  1050],
  'andrew':            [500,  1050],
  'sonal':             [800,  1000],
  'david':             [1050, 1050],
  'wade-foster':       [300,  1150],
  'tomer-london':      [600,  1150],
  'balaji':            [900,  1100],
  'naval':             [200,  1200],
  'reid-hoffman':      [500,  1200],
  'wozniak':           [800,  1200],
  'nicole-brichtova':  [1050, 1150],
  'tomer-cohen':       [350,  1250],
  'alex-karp':         [700,  1250],
};

// Match blocks like:
// id: 'marc',
// ...
// px: 200,  py: 500,
// Use a stateful approach: find id, then replace the next px/py line

let updatedCount = 0;
for (const [id, [px, py]] of Object.entries(positions)) {
  // Find the guest block by id and update its px/py
  // Pattern: id: 'marc', followed eventually by px: NNN, py: NNN
  const idPattern = new RegExp(
    `(id:\\s*'${id.replace('-', '\\-')}'[^}]*?)(px:\\s*\\d+,\\s*py:\\s*\\d+)`,
    's'
  );
  const replacement = `$1px: ${px},  py: ${py}`;
  const newContent = content.replace(idPattern, replacement);
  if (newContent !== content) {
    content = newContent;
    updatedCount++;
    console.log(`✓ ${id}: px=${px}, py=${py}`);
  } else {
    console.warn(`✗ ${id}: NOT FOUND or not updated`);
  }
}

fs.writeFileSync(guestsFile, content, 'utf8');
console.log(`\nUpdated ${updatedCount}/${Object.keys(positions).length} guest positions.`);
