'use strict';
/**
 * The numbers behind the admin panel. Days are counted in India Standard Time,
 * the site's audience, so "today" starts at midnight IST.
 */

const TZ = 'Asia/Kolkata';
const DAY_MS = 24 * 3600 * 1000;

const models = () => ({
  Visit:      require('../models/Visit'),
  User:       require('../models/User'),
  Subscriber: require('../models/Subscriber'),
  SavedItem:  require('../models/SavedItem'),
  AlertRun:   require('../models/AlertRun'),
});

/** "YYYY-MM-DD" of a moment, in IST. */
const istDay = date => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

/** Midnight IST that starts the day `daysAgo` days before today. */
function istMidnight(daysAgo = 0, now = new Date()) {
  return new Date(new Date(`${istDay(now)}T00:00:00+05:30`).getTime() - daysAgo * DAY_MS);
}

/** Every IST day from `from` to today, oldest first. */
function dayList(days, now = new Date()) {
  return Array.from({ length: days }, (_, i) => istDay(new Date(istMidnight(days - 1 - i, now).getTime() + 12 * 3600 * 1000)));
}

const distinctCount = async (Model, field, filter) => (await Model.distinct(field, filter)).length;

/** Visitors and page views from `since` on. */
async function visitCounts(since) {
  const { Visit } = models();
  const filter = { at: { $gte: since } };
  const [views, visitors] = await Promise.all([Visit.countDocuments(filter), distinctCount(Visit, 'visitorId', filter)]);
  return { views, visitors };
}

async function overview() {
  const { Visit, User, Subscriber, SavedItem, AlertRun } = models();
  const weekAgo = new Date(Date.now() - 7 * DAY_MS);
  const [today, last7, last30, live, users, newUsers, subsActive, subsTotal, newSubs, savedAgg, lastRun] = await Promise.all([
    visitCounts(istMidnight(0)),
    visitCounts(istMidnight(6)),
    visitCounts(istMidnight(29)),
    distinctCount(Visit, 'visitorId', { at: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Subscriber.countDocuments({ active: true }),
    Subscriber.countDocuments(),
    Subscriber.countDocuments({ createdAt: { $gte: weekAgo } }),
    SavedItem.aggregate([{ $group: {
      _id: null,
      bookmarked: { $sum: { $cond: ['$bookmarked', 1, 0] } },
      applied:    { $sum: { $cond: ['$applied', 1, 0] } },
      users:      { $addToSet: '$user' },
    } }]),
    AlertRun.findOne().sort({ startedAt: -1 }).lean(),
  ]);
  const saved = savedAgg[0] || { bookmarked: 0, applied: 0, users: [] };
  return {
    visitors: { today: today.visitors, last7: last7.visitors, last30: last30.visitors, live },
    pageViews: { today: today.views, last7: last7.views, last30: last30.views },
    users: { total: users, new7: newUsers },
    subscribers: { active: subsActive, total: subsTotal, new7: newSubs },
    saved: { bookmarked: saved.bookmarked, applied: saved.applied, users: saved.users.length },
    lastAlertRun: lastRun,
  };
}

/** Traffic for the last `days` IST days, today included. */
async function traffic(days) {
  const { Visit } = models();
  const from = istMidnight(days - 1);
  const top = (field, limit, extra = []) => [
    ...extra,
    { $group: { _id: `$${field}`, views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
    { $project: { _id: 0, key: '$_id', views: 1, visitors: { $size: '$visitors' } } },
    { $sort: { visitors: -1, views: -1 } },
    { $limit: limit },
  ];
  const [facets] = await Visit.aggregate([
    { $match: { at: { $gte: from } } },
    { $facet: {
      totals: [{ $group: {
        _id: null,
        views: { $sum: 1 },
        visitors: { $addToSet: '$visitorId' },
        sessions: { $addToSet: '$sessionId' },
        newVisitors: { $addToSet: { $cond: ['$newVisitor', '$visitorId', '$$REMOVE'] } },
      } }, { $project: { _id: 0, views: 1, visitors: { $size: '$visitors' }, sessions: { $size: '$sessions' }, newVisitors: { $size: '$newVisitors' } } }],
      daily: [
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$at', timezone: TZ } }, views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { _id: 0, date: '$_id', views: 1, visitors: { $size: '$visitors' } } },
      ],
      pages:     top('page', 12),
      referrers: top('referrer', 10, [{ $match: { referrer: { $ne: '' } } }]),
      direct:    [{ $match: { referrer: '' } }, { $group: { _id: null, visitors: { $addToSet: '$visitorId' } } }, { $project: { _id: 0, visitors: { $size: '$visitors' } } }],
      devices:   top('device', 5),
      browsers:  top('browser', 8),
      os:        top('os', 8),
    } },
  ]);
  const byDay = new Map(facets.daily.map(d => [d.date, d]));
  const totals = facets.totals[0] || { views: 0, visitors: 0, sessions: 0, newVisitors: 0 };
  return {
    range: { days, from: from.toISOString(), to: new Date().toISOString(), timezone: TZ },
    totals: { ...totals, returningVisitors: Math.max(0, totals.visitors - totals.newVisitors) },
    daily: dayList(days).map(date => byDay.get(date) || { date, views: 0, visitors: 0 }),
    pages: facets.pages,
    referrers: facets.referrers,
    directVisitors: facets.direct[0]?.visitors || 0,
    devices: facets.devices,
    browsers: facets.browsers,
    os: facets.os,
  };
}

/** The most bookmarked and applied-to jobs and companies. */
async function topSaved(limit = 10) {
  const { SavedItem } = models();
  const pipeline = kind => [
    { $match: { kind } },
    { $group: {
      _id: '$itemId',
      bookmarked: { $sum: { $cond: ['$bookmarked', 1, 0] } },
      applied:    { $sum: { $cond: ['$applied', 1, 0] } },
      data:       { $first: '$data' },
    } },
    { $addFields: { total: { $add: ['$bookmarked', '$applied'] } } },
    { $sort: { total: -1, applied: -1 } },
    { $limit: limit },
    { $project: { _id: 0, itemId: '$_id', bookmarked: 1, applied: 1, data: 1 } },
  ];
  const [jobs, companies] = await Promise.all([SavedItem.aggregate(pipeline('job')), SavedItem.aggregate(pipeline('company'))]);
  return { jobs, companies };
}

/** A breakdown of the live job feed. */
function feedBreakdown(jobs) {
  const countBy = (fn, limit) => {
    const m = new Map();
    for (const j of jobs) { const k = fn(j) || 'Unknown'; m.set(k, (m.get(k) || 0) + 1); }
    return [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count).slice(0, limit);
  };
  return {
    total: jobs.length,
    internships: jobs.filter(j => j.isInternship).length,
    newToday: jobs.filter(j => j.isNew).length,
    sources: countBy(j => j.source, 10),
    workModes: countBy(j => j.workMode, 5),
    countries: countBy(j => j.country, 10),
  };
}

const csvCell = v => {
  let s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;   // stop spreadsheets running a cell as a formula
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
/** CSV text from a header row and rows of values. */
const toCsv = (header, rows) => [header, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

module.exports = { overview, traffic, topSaved, feedBreakdown, toCsv, istDay, istMidnight, dayList };
