// ✅ recommender.js
console.log('recommender.js loaded');
import fetch from 'node-fetch';
import { fetchUserSolved } from './api.js';

export function recommendProblems(allProblems, solvedIds, userRating, tagPopularity, count = 20) {
  const RECENT_LIMIT = 200;
  const RATING_RANGE = 200;

  const recentFiltered = allProblems
    .filter(p => !solvedIds.has(p.id) && p.rating && Math.abs(p.rating - userRating) <= RATING_RANGE)
    .sort((a, b) => b.contestId - a.contestId)
    .slice(0, RECENT_LIMIT);

  const scored = recentFiltered.map(problem => {
    const tagScore = problem.tags.reduce((score, tag) => {
      return score + (tagPopularity[tag] || 0);
    }, 0);

    const ratingScore = 1 - Math.abs(problem.rating - userRating) / RATING_RANGE;
    const finalScore = tagScore + 2 * ratingScore; // rating match is more important
    return { problem, score: finalScore };
  });

  scored.sort((a, b) => b.score - a.score);
  console.log('recommendProblems export:', typeof recommendProblems);
  return scored.slice(0, count).map(e => e.problem);
}

export async function recommendPersonalizedProblems({ allProblems, solved, userRating, count }) {
  console.log('DEBUG: recommendPersonalizedProblems called');
  // Step 1: Fetch 15 users with rating close to (userRating + 500)
  const targetRating = userRating + 500;
  const similarUsers = await fetchUsersByRating(targetRating, 15);
  console.log('DEBUG: similarUsers =', similarUsers);

  // Step 2: Build tag frequency for these users
  const tagCounts = {};
  let tagTotal = 0;
  for (const user of similarUsers) {
    const userSolved = await fetchUserSolved(user);
    for (const pid of userSolved) {
      const prob = allProblems.find(p => p.id === pid);
      if (prob && prob.tags) {
        for (const tag of prob.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          tagTotal++;
        }
      }
    }
  }
  const groupTagRatios = {};
  for (const tag in tagCounts) {
    groupTagRatios[tag] = tagCounts[tag] / tagTotal;
  }

  // Step 3: Build your tag frequency
  const yourTagCounts = {};
  let yourTagTotal = 0;
  for (const pid of solved) {
    const prob = allProblems.find(p => p.id === pid);
    if (prob && prob.tags) {
      for (const tag of prob.tags) {
        yourTagCounts[tag] = (yourTagCounts[tag] || 0) + 1;
        yourTagTotal++;
      }
    }
  }
  const yourTagRatios = {};
  for (const tag in yourTagCounts) {
    yourTagRatios[tag] = yourTagCounts[tag] / yourTagTotal;
  }

  // Step 4: Find tags where group ratio > your ratio
  const tagDiffs = [];
  for (const tag in groupTagRatios) {
    const diff = groupTagRatios[tag] - (yourTagRatios[tag] || 0);
    if (diff > 0) tagDiffs.push({ tag, diff });
  }
  tagDiffs.sort((a, b) => b.diff - a.diff);
  const topTags = tagDiffs.slice(0, 3).map(t => t.tag); // Pick top 3 tag gaps

  // Step 5: Recommend from latest 1000 problems, with topTags, within rating range, multi-tag, and no *special tags
  const sortedProblems = allProblems.slice().sort((a, b) => b.contestId - a.contestId || b.index.localeCompare(a.index));
  const latestProblems = sortedProblems.slice(0, 1000);
  const recommendations = latestProblems.filter(p =>
    topTags.some(tag => p.tags.includes(tag)) &&
    Math.abs(p.rating - userRating) <= 200 &&
    !solved.has(p.id) &&
    p.tags.length > 1 &&
    !p.tags.some(tag => tag.startsWith('*'))
  ).slice(0, count);

  return recommendations;
}

// Helper: fetch 15 users with rating close to (userRating + 500)
async function fetchUsersByRating(targetRating, count = 15) {
  const res = await fetch('https://codeforces.com/api/user.ratedList?activeOnly=true');
  const data = await res.json();
  if (data.status !== 'OK') return [];
  // Sort users by absolute difference from targetRating, ascending order
  const sorted = data.result
    .filter(u => u.rating && Math.abs(u.rating - targetRating) <= 100) // Only users within ±100 of targetRating
    .sort((a, b) => Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating));
  // Pick top N users
  const picked = sorted.slice(0, count);
  return picked.map(u => u.handle);
}

