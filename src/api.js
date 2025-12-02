// ✅ api.js
import fs from 'fs';
import fetch from 'node-fetch';

const CACHE_FILE = 'cache.json';
const CF_API = 'https://codeforces.com/api';
const TOP_USERS = ['tourist', 'Benq', 'Radewoosh', 'Petr', 'neal'];

export async function refreshProblemCache() {
  try {
    // console.log('Starting fetch for problemset.problems...');
    const res = await fetch(`${CF_API}/problemset.problems`);
    // console.log('Fetch completed, status:', res.status);
    const data = await res.json();
    // console.log('Fetched problemset.problems response:', JSON.stringify(data, null, 2));
    const problems = data.result?.problems?.map(p => ({
      id: `${p.contestId}${p.index}`,
      name: p.name,
      tags: p.tags,
      rating: p.rating,
      contestId: p.contestId,
      index: p.index
    })).filter(p => p.rating) || [];
    fs.writeFileSync(CACHE_FILE, JSON.stringify(problems, null, 2));
    // console.log('Problems written to cache:', problems.length);
  } catch (err) {
    console.error('Error in refreshProblemCache:', err);
  }
}

export function loadCachedProblems() {
  return JSON.parse(fs.readFileSync(CACHE_FILE));
}

export async function fetchUserSolved(handle) {
  try {
    // console.log(`Starting fetch for user.status?handle=${handle}...`);
    const res = await fetch(`${CF_API}/user.status?handle=${handle}`);
    // console.log('Fetch completed, status:', res.status);
    const data = await res.json();
    // console.log(`Fetched user.status for ${handle}:`, JSON.stringify(data, null, 2));
    const solved = new Set();
    data.result?.forEach(sub => {
      if (sub.verdict === 'OK') {
        solved.add(`${sub.problem.contestId}${sub.problem.index}`);
      }
    });
    // console.log(`Solved set for ${handle}:`, Array.from(solved));
    return solved;
  } catch (err) {
    console.error(`Error in fetchUserSolved for ${handle}:`, err);
    return new Set();
  }
}

export async function fetchUserRating(handle) {
  try {
    // console.log(`Starting fetch for user.info?handles=${handle}...`);
    const res = await fetch(`${CF_API}/user.info?handles=${handle}`);
    // console.log('Fetch completed, status:', res.status);
    const data = await res.json();
    // console.log(`Fetched user.info for ${handle}:`, JSON.stringify(data, null, 2));
    return data.result?.[0]?.rating || 1200;
  } catch (err) {
    console.error(`Error in fetchUserRating for ${handle}:`, err);
    return 1200;
  }
}

export async function fetchTopUserTagStats() {
  const tagCounts = {};
  for (const user of TOP_USERS) {
    try {
      // console.log(`Starting fetch for user.status?handle=${user}...`);
      const res = await fetch(`${CF_API}/user.status?handle=${user}`);
      // console.log('Fetch completed, status:', res.status);
      const data = await res.json();
      // console.log(`Fetched user.status for top user ${user}:`, JSON.stringify(data, null, 2));
      for (const sub of data.result || []) {
        if (sub.verdict === 'OK' && sub.problem.tags) {
          for (const tag of sub.problem.tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }
    } catch (err) {
      console.error(`Error in fetchTopUserTagStats for ${user}:`, err);
    }
  }
  // console.log('Top user tag stats:', tagCounts);
  return tagCounts;
}

