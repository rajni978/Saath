async function getNow(profile) {
  return new Date(Date.now() + (profile.timeOffsetMin || 0) * 60000);
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

module.exports = { getNow, startOfDay, endOfDay };
