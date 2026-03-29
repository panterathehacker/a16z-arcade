const fs = require('fs');

const results = JSON.parse(fs.readFileSync('/tmp/podcast-questions.json', 'utf8'));
let content = fs.readFileSync('game/data/guests.ts', 'utf8');

let updatedCount = 0;

for (const [id, questions] of Object.entries(results)) {
  if (!questions || questions.length === 0) {
    console.log(`Skipping ${id} — no questions`);
    continue;
  }

  const qArray = questions.map(q => `      {
        text: ${JSON.stringify(q.text)},
        options: [${q.options.map(o => JSON.stringify(o)).join(', ')}],
        correct: ${q.correct},
      }`).join(',\n');

  // Match the questions block for this guest id
  // Pattern: find "id: '<id>'" then find the questions: [ ... ] block and replace its contents
  const pattern = new RegExp(
    `(id: '${id}'[\\s\\S]*?questions: \\[)[\\s\\S]*?(\\n    \\],)`,
    'g'
  );

  const before = content;
  content = content.replace(pattern, `$1\n${qArray},\n$2`);

  if (content !== before) {
    updatedCount++;
    console.log(`Updated ${id}`);
  } else {
    console.log(`No match found for ${id} — check pattern`);
  }
}

fs.writeFileSync('game/data/guests.ts', content);
console.log(`\nDone! Updated ${updatedCount}/25 guests.`);
