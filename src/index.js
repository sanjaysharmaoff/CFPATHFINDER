// Directory: cfbuddy-js
// Files:
// - index.js (entry point)
// - api.js (for fetching data from Codeforces)
// - recommender.js (for recommendation logic)
// - cache.json (problemset cache)
// - package.json

console.log('index.js started');

// ✅ index.js
import { Command } from 'commander';
import { fetchUserSolved, loadCachedProblems, refreshProblemCache, fetchUserRating } from './api.js';
import { recommendPersonalizedProblems } from './recommender.js';
import chalk from 'chalk';
import Table from 'cli-table3';

const program = new Command();

program
  .command('refresh')
  .description('Refresh problemset cache')
  .action(async () => {
    await refreshProblemCache();
    console.log(chalk.green('✅ Problemset cache updated.'));
  });

program
  .command('recommend')
  .requiredOption('--handle <handle>', 'Codeforces user handle')
  .option('--count <count>', 'Number of problems to recommend', 20)
  .description('Recommend unsolved problems for a user')
  .action(async (opts) => {
    console.log('DEBUG: recommend command started');
    const { handle, count } = opts;
    const startTime = Date.now();
    const solved = await fetchUserSolved(handle);
    const userRating = await fetchUserRating(handle);

    // Check if user exists (fetchUserSolved returns empty set for non-existent users)
    if (!solved || solved.size === 0) {
      console.log(chalk.red(`❌ User "${handle}" does not exist or has no solved problems on Codeforces.`));
      return;
    }

    // Check if user is rated above 2500
    if (userRating > 2500) {
      console.log(chalk.yellow(`⚠️  User "${handle}" is rated above 2500. Personalized recommendations are not supported for very high-rated users.`));
      return;
    }

    const allProblems = loadCachedProblems();
    console.log('DEBUG: solved.size =', solved.size || solved.length);
    console.log('DEBUG: userRating =', userRating);
    console.log('DEBUG: allProblems.length =', allProblems.length);
    const recommendations = await recommendPersonalizedProblems({ allProblems, solved, userRating, count: parseInt(count) });
    const endTime = Date.now();
    const elapsed = ((endTime - startTime) / 1000).toFixed(2);
    console.log('DEBUG: recommendations.length =', recommendations.length);
    const table = new Table({ head: ['Name', 'Rating', 'Tags', 'Link'] });
    for (const p of recommendations) {
      const link = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
      table.push([chalk.cyan(p.name), p.rating, p.tags.join(', '), chalk.blue(link)]);
    }
    console.log(chalk.yellow(`\n🤖 Recommendations for ${handle}\n`));
    console.log(table.toString());
    console.log(chalk.green(`Query completed in ${elapsed} seconds.`));
  });

program.parse(process.argv);

if (process.argv.length <= 2) {
  console.log('No command provided. Try "refresh" or "recommend".');
}

