let db = global.db || [];
global.db = db;

export default function handler(req, res) {
  if (req.method === "POST") {
    const { embedding } = req.body;
    db.push(embedding);
    res.status(200).json({ ok: true });
  } else {
    res.status(405).end();
  }
}