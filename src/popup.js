import inquirer from 'inquirer';
import { fetchUserSolved, loadCachedProblems, fetchUserRating } from './api.js';
import { recommendPersonalizedProblems } from './recommender.js';
import Table from 'cli-table3';

async function main() {
  const { handle } = await inquirer.prompt([
    { type: 'input', name: 'handle', message: 'Enter your Codeforces handle:' }
  ]);
  const { count } = await inquirer.prompt([
    { type: 'number', name: 'count', message: 'How many problems to recommend?', default: 10 }
  ]);

  console.log('Fetching recommendations...');
  const solved = await fetchUserSolved(handle);
  const userRating = await fetchUserRating(handle);

  // Check if user exists (fetchUserSolved returns empty set for non-existent users)
  if (!solved || solved.size === 0) {
    console.log(`❌ User "${handle}" does not exist or has no solved problems on Codeforces.`);
    return;
  }

  // Check if user is rated above 2500
  if (userRating > 2500) {
    console.log(`⚠️  User "${handle}" is rated above 2500. Personalized recommendations are not supported for very high-rated users.`);
    return;
  }

  const allProblems = loadCachedProblems();
  const recommendations = await recommendPersonalizedProblems({
    allProblems, solved, userRating, count
  });

  const table = new Table({ head: ['Name', 'Rating', 'Tags', 'Link'] });
  for (const p of recommendations) {
    const link = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
    table.push([p.name, p.rating, p.tags.join(', '), link]);
  }
  console.log(table.toString());
}

main();
