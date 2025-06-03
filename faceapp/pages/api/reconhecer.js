let db = global.db || [];
global.db = db;

function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    let d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export default function handler(req, res) {
  if (req.method === "POST") {
    const { embedding } = req.body;
    let found = false;
    for (let saved of db) {
      if (euclidean(saved, embedding) < 0.5) { // Threshold
        found = true;
        break;
      }
    }
    res.status(200).json({ match: found });
  } else {
    res.status(405).end();
  }
}