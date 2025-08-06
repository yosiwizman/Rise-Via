module.exports = (req, res) => {
  res.json({ test: "ok", timestamp: new Date().toISOString() });
};
